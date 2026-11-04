import { SLOT_WINDOW_DAYS } from '../config/constants';

/** UTC の日付文字列（YYYY-MM-DD）。Rails 版 Date.current（既定の UTC）と同じ扱い。 */
export function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysUtc(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/** 枠の参照期間（今日〜+SLOT_WINDOW_DAYS 日）。 */
export function slotWindow(now: Date): { from: string; to: string } {
  return {
    from: utcDateString(now),
    to: utcDateString(addDaysUtc(now, SLOT_WINDOW_DAYS)),
  };
}
