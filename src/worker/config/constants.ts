// 数値・識別子などの固定設定。文字列の定数はここか DB（slot_time_templates など）に集約する。

export const SESSION_COOKIE_NAME = 'clinic_session_id';
export const SESSION_TTL_HOURS = 24;

/** Rails 版 HoneypotGuard と同じ入力名（_hp は空であること、submitted_at はミリ秒の投入時刻）。 */
export const HONEYPOT_FIELD_NAME = '_hp';
export const SUBMITTED_AT_FIELD_NAME = 'submitted_at';
export const HONEYPOT_MIN_INTERVAL_SECONDS = 2;

/** 枠の参照期間は「今日（UTC）から +6 日」の 7 日間。 */
export const SLOT_WINDOW_DAYS = 6;

/** 日次リセットは UTC 18:00（JST 03:00）。 */
export const DAILY_RESET_UTC_HOUR = 18;

/** 詳細ページ（/clinic/:id, /reservations/:id）は静的シェル 1 枚を配信し、ID はブラウザ側で読む。 */
export const SHELL_PAGE_ID = '_';

/** 入力の上限（文字数・バイト数）。超えたら 400。 */
export const INPUT_LIMITS = {
  SYMPTOM_MAX_LENGTH: 100,
  AREA_MAX_LENGTH: 50,
  SYMPTOM_NOTE_MAX_LENGTH: 500,
  BODY_MAX_BYTES: 16_384,
} as const;

/** 年齢層（schema の CHECK 制約と一致させる）。 */
export const AGE_GROUPS = ['child', 'teen', 'adult', 'senior'] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
} as const;

export const SLOT_STATUS = {
  OPEN: 'open',
  RESERVED: 'reserved',
} as const;

/** 検索スコア（Rails 版 ClinicFilter と同じ配点）。 */
export const RANKING = {
  DEPT_SCORE_FIRST: 40,
  DEPT_SCORE_SECOND: 25,
  DEPT_SCORE_OTHER: 10,
  SLOT_SCORE_MAX: 30,
  RATING_MULTIPLIER: 6,
} as const;
