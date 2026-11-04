import { DAILY_RESET_UTC_HOUR, SLOT_WINDOW_DAYS } from '../config/constants';
import { addDaysUtc, utcDateString } from '../lib/time';
import { ResetRepository } from '../repo/resetRepository';

export type DailyResetOutcome = 'reset' | 'already_run' | 'not_reset_time';

/**
 * 日次リセット（Cron・UTC 18:00）。同じ UTC 日付で二重実行しない。
 * Rails 版 DailyResetJob.run と同じ判定（時刻・reset_logs）。
 */
export async function runDailyReset(db: D1Database, executedAt: Date): Promise<DailyResetOutcome> {
  if (executedAt.getUTCHours() !== DAILY_RESET_UTC_HOUR) {
    return 'not_reset_time';
  }
  const repository = new ResetRepository(db);
  const resetDate = utcDateString(executedAt);
  if (await repository.hasRunOn(resetDate)) {
    return 'already_run';
  }
  const windowEnd = utcDateString(addDaysUtc(executedAt, SLOT_WINDOW_DAYS));
  await repository.applyDailyReset(resetDate, windowEnd, executedAt.toISOString());
  return 'reset';
}
