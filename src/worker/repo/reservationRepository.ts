import { RESERVATION_STATUS, SLOT_STATUS } from '../config/constants';
import { runBatch, runStatement, selectFirst } from '../lib/d1';

export interface ReservationRow {
  id: number;
  session_id: string;
  clinic_id: number;
  slot_id: number;
  age_group: string;
  symptom_note: string | null;
  status: string;
  reserved_at: string | null;
}

export interface NewReservation {
  sessionId: string;
  slotId: number;
  ageGroup: string;
  symptomNote: string | null;
  nowIso: string;
}

const RESERVATION_COLUMNS = 'id, session_id, clinic_id, slot_id, age_group, symptom_note, status, reserved_at';

export class ReservationRepository {
  constructor(private readonly db: D1Database) {}

  findById(reservationId: number): Promise<ReservationRow | null> {
    return selectFirst<ReservationRow>(
      this.db,
      `SELECT ${RESERVATION_COLUMNS} FROM reservations WHERE id = ?1`,
      [reservationId],
    );
  }

  /**
   * 枠の確保と予約の作成を 1 つのバッチ（D1 のトランザクション）で行う。
   * - 1 文目: open の枠だけを reserved にする（条件付き UPDATE）
   * - 2 文目: その枠を今回の要求が確保したときだけ予約行を作る（枠の updated_at が今回の時刻と一致）
   * 同じ枠の二重予約（uq_reservations_pending_slot）と同日重複（uq_reservations_pending_day）は
   * 一意インデックスが違反を投げ、バッチ全体が戻る。違反の変換は呼び出し側（サービス）で行う。
   * 戻り値は作成した予約 ID。枠を確保できなかったら null。
   */
  async reserveSlot(input: NewReservation): Promise<number | null> {
    const results = await runBatch(this.db, [
      {
        sql: 'UPDATE available_slots SET status = ?2, updated_at = ?3 WHERE id = ?1 AND status = ?4',
        params: [input.slotId, SLOT_STATUS.RESERVED, input.nowIso, SLOT_STATUS.OPEN],
      },
      {
        sql: `INSERT INTO reservations (session_id, clinic_id, slot_id, slot_date, age_group, symptom_note, status, reserved_at, created_at, updated_at)
              SELECT ?1, s.clinic_id, s.id, s.slot_date, ?2, ?3, ?4, ?5, ?5, ?5
              FROM available_slots AS s
              WHERE s.id = ?6 AND s.status = ?7 AND s.updated_at = ?5`,
        params: [
          input.sessionId,
          input.ageGroup,
          input.symptomNote,
          RESERVATION_STATUS.PENDING,
          input.nowIso,
          input.slotId,
          SLOT_STATUS.RESERVED,
        ],
      },
    ]);
    const inserted = results[1];
    return inserted !== undefined && inserted.meta.changes === 1 ? inserted.meta.last_row_id : null;
  }

  /** pending を cancelled に変える。同時に別要求が変えていれば false。 */
  async markCancelled(reservationId: number, sessionId: string, nowIso: string): Promise<boolean> {
    const result = await runStatement(
      this.db,
      'UPDATE reservations SET status = ?3, updated_at = ?4 WHERE id = ?1 AND session_id = ?2 AND status = ?5',
      [reservationId, sessionId, RESERVATION_STATUS.CANCELLED, nowIso, RESERVATION_STATUS.PENDING],
    );
    return result.meta.changes === 1;
  }

  /** キャンセル処理の後続が失敗したときに戻す（補償）。 */
  async markPending(reservationId: number, nowIso: string): Promise<void> {
    await runStatement(
      this.db,
      'UPDATE reservations SET status = ?2, updated_at = ?3 WHERE id = ?1',
      [reservationId, RESERVATION_STATUS.PENDING, nowIso],
    );
  }
}
