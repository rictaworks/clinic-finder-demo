export const AGE_GROUPS = [
  { value: 'child', label: '子供（〜12歳）' },
  { value: 'youth', label: '10〜20代' },
  { value: 'adult', label: '30〜50代' },
  { value: 'senior', label: '60代以上' },
] as const

export const AREAS = [
  { value: '渋谷', label: '渋谷' },
  { value: '新宿', label: '新宿' },
  { value: '池袋', label: '池袋' },
  { value: '品川', label: '品川' },
  { value: '銀座', label: '銀座' },
  { value: '上野', label: '上野' },
  { value: '秋葉原', label: '秋葉原' },
  { value: '吉祥寺', label: '吉祥寺' },
  { value: '横浜', label: '横浜' },
  { value: '川崎', label: '川崎' },
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
