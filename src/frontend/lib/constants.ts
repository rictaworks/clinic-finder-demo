export const AGE_GROUPS = [
  { value: 'child', label: '子供（〜12歳）' },
  { value: 'youth', label: '10〜20代' },
  { value: 'adult', label: '30〜50代' },
  { value: 'senior', label: '60代以上' },
] as const

export const HONEYPOT_MIN_INTERVAL_MS = 2000

export const SLOT_STATUS = {
  OPEN: 'open',
  RESERVED: 'reserved',
} as const

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
} as const

export const ERROR_MESSAGES = {
  NETWORK: 'ネットワークエラーが発生しました。しばらくしてから再試行してください。',
  SLOT_CONFLICT: 'この枠はすでに予約されました。別の枠をお選びください。',
  GENERAL: 'エラーが発生しました。しばらくしてから再試行してください。',
  HONEYPOT: 'フォームの送信が早すぎます。しばらくしてから再試行してください。',
  DOUBLE_BOOKING: 'この日はすでに予約があります。別の日をお選びください。',
} as const
