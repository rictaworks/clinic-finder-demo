import { HONEYPOT_FIELD_NAME, HONEYPOT_MIN_INTERVAL_SECONDS, SUBMITTED_AT_FIELD_NAME } from '../config/constants';
import type { RawParams } from '../lib/params';
import { toRubyFloat } from '../lib/params';
import { writeLog } from '../lib/logger';

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Rails 版 HoneypotGuard と同じ判定。
 * - _hp に値があれば不合格
 * - submitted_at（ミリ秒）から MIN_INTERVAL 秒未満なら不合格（未指定は合格）
 */
export function passesHoneypot(params: RawParams, nowMs: number): boolean {
  if (!isBlank(params[HONEYPOT_FIELD_NAME])) {
    writeLog('warn', 'HoneypotGuard', 'honeypot field filled');
    return false;
  }
  const submittedAt = params[SUBMITTED_AT_FIELD_NAME];
  if (isBlank(submittedAt)) {
    return true;
  }
  const submittedSeconds = toRubyFloat(submittedAt) / 1000;
  const elapsedSeconds = nowMs / 1000 - submittedSeconds;
  if (elapsedSeconds < HONEYPOT_MIN_INTERVAL_SECONDS) {
    writeLog('warn', 'HoneypotGuard', 'submission too fast');
    return false;
  }
  return true;
}
