import { SLOT_STATUS } from '../config/constants';
import { runStatement, selectAll, selectFirst } from '../lib/d1';

export interface SlotRow {
  id: number;
  clinic_id: number;
  slot_date: string;
  slot_time: string;
  status: string;
  capacity: number;
}

export interface OpenSlotCountRow {
  clinic_id: number;
  open_count: number;
}

const SLOT_COLUMNS = 'id, clinic_id, slot_date, slot_time, status, capacity';

export class SlotRepository {
  constructor(private readonly db: D1Database) {}

  findById(slotId: number): Promise<SlotRow | null> {
    return selectFirst<SlotRow>(this.db, `SELECT ${SLOT_COLUMNS} FROM available_slots WHERE id = ?1`, [slotId]);
  }

  listForClinic(clinicId: number, fromDate: string, toDate: string): Promise<SlotRow[]> {
    return selectAll<SlotRow>(
      this.db,
      `SELECT ${SLOT_COLUMNS} FROM available_slots
       WHERE clinic_id = ?1 AND slot_date BETWEEN ?2 AND ?3
       ORDER BY slot_date, slot_time`,
      [clinicId, fromDate, toDate],
    );
  }

  countOpenByClinic(fromDate: string, toDate: string): Promise<OpenSlotCountRow[]> {
    return selectAll<OpenSlotCountRow>(
      this.db,
      `SELECT clinic_id, COUNT(*) AS open_count FROM available_slots
       WHERE status = ?1 AND slot_date BETWEEN ?2 AND ?3
       GROUP BY clinic_id`,
      [SLOT_STATUS.OPEN, fromDate, toDate],
    );
  }

  /** キャンセル時に枠を open に戻す（予約の確保は reservationRepository.reserveSlot のバッチで行う）。 */
  async releaseSlot(slotId: number, nowIso: string): Promise<void> {
    await runStatement(
      this.db,
      'UPDATE available_slots SET status = ?2, updated_at = ?3 WHERE id = ?1',
      [slotId, SLOT_STATUS.OPEN, nowIso],
    );
  }
}
