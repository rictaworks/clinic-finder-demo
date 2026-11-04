import { AGE_GROUPS, RESERVATION_STATUS, SLOT_STATUS, type AgeGroup } from '../config/constants';
import { MESSAGES } from '../config/messages';
import { DomainError, NotFoundError } from '../lib/errors';
import { writeLog } from '../lib/logger';
import { utcDateString } from '../lib/time';
import type { ClinicRepository } from '../repo/clinicRepository';
import type { ReservationRepository, ReservationRow } from '../repo/reservationRepository';
import type { SlotRepository } from '../repo/slotRepository';
import { groupDepartments, toClinicJson, toReservationJson, type ReservationJson } from '../serializers';

export interface ReserveInput {
  clinicId: number | null;
  slotId: number | null;
  ageGroup: string;
  symptomNote: string | null;
  sessionId: string;
}

function isAgeGroup(value: string): value is AgeGroup {
  return (AGE_GROUPS as readonly string[]).includes(value);
}

/**
 * 一意インデックスの違反（同じ枠・同日重複）を業務エラーに変換する。それ以外はそのまま投げ直す。
 * 違反のメッセージに含まれる列名・インデックス名で判別する。
 */
function toReservationConflict(error: unknown): unknown {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes('UNIQUE constraint failed')) {
    return error;
  }
  writeLog('warn', 'ReservationService', 'unique index rejected the reservation');
  if (message.includes('slot_id') || message.includes('uq_reservations_pending_slot')) {
    return new DomainError(MESSAGES.slotNotAvailable);
  }
  if (message.includes('slot_date') || message.includes('uq_reservations_pending_day')) {
    return new DomainError(MESSAGES.duplicateSameDay);
  }
  return error;
}

/**
 * 仮予約（F06）・予約確認（F07）・キャンセル（F07）。
 * 予約の作成は枠の確保と同じバッチ（トランザクション）で行い、同日重複・二重予約は DB の一意制約が拒否する。
 */
export class ReservationService {
  constructor(
    private readonly reservations: ReservationRepository,
    private readonly slots: SlotRepository,
    private readonly clinics: ClinicRepository,
    private readonly clock: () => Date,
  ) {}

  async reserve(input: ReserveInput): Promise<ReservationJson> {
    const now = this.clock();
    const slot = input.slotId === null ? null : await this.slots.findById(input.slotId);
    if (!slot) {
      throw new DomainError(MESSAGES.slotNotFound);
    }
    if (slot.status !== SLOT_STATUS.OPEN) {
      throw new DomainError(MESSAGES.slotNotAvailable);
    }
    if (input.clinicId === null || slot.clinic_id !== input.clinicId) {
      throw new DomainError(MESSAGES.slotClinicMismatch);
    }
    if (slot.slot_date < utcDateString(now)) {
      throw new DomainError(MESSAGES.slotInPast);
    }
    if (!isAgeGroup(input.ageGroup)) {
      throw new DomainError(MESSAGES.validationFailed);
    }

    let reservationId: number | null;
    try {
      reservationId = await this.reservations.reserveSlot({
        sessionId: input.sessionId,
        slotId: slot.id,
        ageGroup: input.ageGroup,
        symptomNote: input.symptomNote,
        nowIso: now.toISOString(),
      });
    } catch (error) {
      throw toReservationConflict(error);
    }
    if (reservationId === null) {
      throw new DomainError(MESSAGES.slotNotAvailable);
    }
    writeLog('info', 'ReservationService', 'reserved', { reservationId });

    const row = await this.reservations.findById(reservationId);
    if (!row) {
      throw new NotFoundError(MESSAGES.reservationNotFound);
    }
    return this.toJson(row);
  }

  async getOwned(reservationId: number, sessionId: string): Promise<ReservationJson> {
    const row = await this.findOwned(reservationId, sessionId);
    return this.toJson(row);
  }

  async cancel(reservationId: number, sessionId: string): Promise<ReservationJson> {
    const row = await this.findOwned(reservationId, sessionId);
    if (row.status === RESERVATION_STATUS.CANCELLED) {
      throw new DomainError(MESSAGES.alreadyCancelled);
    }
    const nowIso = this.clock().toISOString();
    const cancelled = await this.reservations.markCancelled(row.id, sessionId, nowIso);
    if (!cancelled) {
      throw new DomainError(MESSAGES.alreadyCancelled);
    }
    try {
      await this.slots.releaseSlot(row.slot_id, nowIso);
    } catch (error) {
      await this.reservations.markPending(row.id, nowIso);
      writeLog('error', 'ReservationService', 'slot release failed, cancellation reverted');
      throw error;
    }
    writeLog('info', 'ReservationService', 'cancelled', { reservationId: row.id });

    const updated = await this.reservations.findById(row.id);
    if (!updated) {
      throw new NotFoundError(MESSAGES.reservationNotFound);
    }
    return this.toJson(updated);
  }

  /** 他人の予約と存在しない予約を区別せず、どちらも 404 にする（予約 ID の存在を漏らさない）。 */
  private async findOwned(reservationId: number, sessionId: string): Promise<ReservationRow> {
    const row = await this.reservations.findById(reservationId);
    if (!row || row.session_id !== sessionId) {
      writeLog('warn', 'ReservationService', 'reservation not visible to this session');
      throw new NotFoundError(MESSAGES.reservationNotFound);
    }
    return row;
  }

  private async toJson(row: ReservationRow): Promise<ReservationJson> {
    const slot = await this.slots.findById(row.slot_id);
    const clinic = await this.clinics.findById(row.clinic_id);
    if (!slot || !clinic) {
      throw new NotFoundError(MESSAGES.reservationNotFound);
    }
    const departments = groupDepartments(await this.clinics.listDepartmentsForClinics([clinic.id])).get(clinic.id) ?? [];
    return toReservationJson(row, toClinicJson(clinic, departments), slot);
  }
}
