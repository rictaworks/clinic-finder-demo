import { runBatch, selectFirst } from '../lib/d1';

/**
 * 日次リセット（Rails 版 DailyResetJob と同じ内容）。
 * 予約・セッションを削除し、枠を open に戻す。枠は参照期間（今日〜+6 日）が途切れないよう補充する。
 */
export class ResetRepository {
  constructor(private readonly db: D1Database) {}

  async hasRunOn(resetDate: string): Promise<boolean> {
    const row = await selectFirst<{ found: number }>(
      this.db,
      'SELECT 1 AS found FROM reset_logs WHERE reset_date = ?1 LIMIT 1',
      [resetDate],
    );
    return row !== null;
  }

  /**
   * 管理用（Cron 専用。HTTP の経路からは呼ばない）。1 つのバッチ（トランザクション）で実行し、途中失敗時は全体を戻す。
   * 開け直す枠は参照期間（resetDate 以降）に限る。過去日の枠は予約を受け付けないため触らない。
   */
  async applyDailyReset(resetDate: string, windowEndDate: string, nowIso: string): Promise<void> {
    await runBatch(this.db, [
      { sql: 'DELETE FROM reservations', params: [] },
      { sql: 'DELETE FROM sessions', params: [] },
      {
        sql: "UPDATE available_slots SET status = 'open', capacity = 1, updated_at = ?1 WHERE slot_date >= ?2",
        params: [nowIso, resetDate],
      },
      {
        sql: `WITH RECURSIVE window_days(slot_date) AS (
                SELECT date(?1)
                UNION ALL
                SELECT date(slot_date, '+1 day') FROM window_days WHERE slot_date < date(?2)
              )
              INSERT OR IGNORE INTO available_slots (clinic_id, slot_date, slot_time, status, capacity, created_at, updated_at)
              SELECT c.id, d.slot_date, t.slot_time, 'open', 1, ?3, ?3
              FROM clinics AS c
              CROSS JOIN window_days AS d
              CROSS JOIN slot_time_templates AS t`,
        params: [resetDate, windowEndDate, nowIso],
      },
      {
        sql: 'INSERT INTO reset_logs (reset_date, executed_at, created_at, updated_at) VALUES (?1, ?2, ?2, ?2)',
        params: [resetDate, nowIso],
      },
    ]);
  }
}
