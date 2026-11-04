// API が返すメッセージ。フロントは HTTP ステータスで分岐するため、本文は運用ログと突き合わせ用の英文を維持する。

export const MESSAGES = {
  badRequest: 'Bad request',
  notFound: 'Not found',
  internalError: 'Internal server error',
  clinicNotFound: 'Clinic not found',
  reservationNotFound: 'Reservation not found',
  slotNotFound: 'Slot not found',
  slotNotAvailable: 'Slot not available',
  slotClinicMismatch: 'Slot does not belong to clinic',
  slotInPast: 'Slot date is in the past',
  duplicateSameDay: 'Already reserved for this clinic on this date',
  validationFailed: 'Validation failed',
  alreadyCancelled: 'Already cancelled',
} as const;
