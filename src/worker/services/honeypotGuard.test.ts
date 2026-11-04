import { describe, expect, it } from 'vitest';
import { passesHoneypot } from './honeypotGuard';

const NOW_MS = Date.parse('2026-11-04T12:00:00Z');

describe('passesHoneypot（Rails 版 HoneypotGuard と同じ判定）', () => {
  it('_hp に値があれば不合格', () => {
    expect(passesHoneypot({ _hp: 'bot' }, NOW_MS)).toBe(false);
  });

  it('_hp が空白だけなら合格（present? と同じ扱い）', () => {
    expect(passesHoneypot({ _hp: '   ' }, NOW_MS)).toBe(true);
  });

  it('投入から 2 秒未満なら不合格', () => {
    expect(passesHoneypot({ submitted_at: String(NOW_MS - 500) }, NOW_MS)).toBe(false);
  });

  it('投入から 2 秒以上なら合格（ミリ秒の数値・文字列の両方）', () => {
    expect(passesHoneypot({ submitted_at: NOW_MS - 5000 }, NOW_MS)).toBe(true);
    expect(passesHoneypot({ submitted_at: String(NOW_MS - 5000) }, NOW_MS)).toBe(true);
  });

  it('submitted_at が無ければ合格', () => {
    expect(passesHoneypot({}, NOW_MS)).toBe(true);
    expect(passesHoneypot({ submitted_at: '' }, NOW_MS)).toBe(true);
  });

  it('数値として読めない submitted_at は 0 として扱う（Ruby の to_f と同じ）', () => {
    expect(passesHoneypot({ submitted_at: 'abc' }, NOW_MS)).toBe(true);
  });
});
