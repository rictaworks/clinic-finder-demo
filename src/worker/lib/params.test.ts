import { describe, expect, it } from 'vitest';
import { readCookie, buildSessionCookie } from './cookie';
import { castBoolean, toPositiveInt, toRubyFloat, toTrimmedString } from './params';

describe('castBoolean（Rails 版 ActiveModel::Type::Boolean）', () => {
  it('偽の表現は false', () => {
    for (const value of [false, 0, '0', 'f', 'false', 'FALSE', 'off', 'OFF']) {
      expect(castBoolean(value)).toBe(false);
    }
  });

  it('真の表現は true、未指定と空文字は null', () => {
    expect(castBoolean(true)).toBe(true);
    expect(castBoolean('true')).toBe(true);
    expect(castBoolean(1)).toBe(true);
    expect(castBoolean(undefined)).toBeNull();
    expect(castBoolean('')).toBeNull();
  });
});

describe('toPositiveInt', () => {
  it('正の整数の数値と文字列を受け付ける', () => {
    expect(toPositiveInt(12)).toBe(12);
    expect(toPositiveInt('12')).toBe(12);
  });

  it('0・負数・小数・非数値は null', () => {
    expect(toPositiveInt(0)).toBeNull();
    expect(toPositiveInt(-3)).toBeNull();
    expect(toPositiveInt(1.5)).toBeNull();
    expect(toPositiveInt('abc')).toBeNull();
    expect(toPositiveInt('1e3')).toBeNull();
  });
});

describe('toTrimmedString / toRubyFloat', () => {
  it('toTrimmedString は null・undefined を空文字にし、前後の空白を除く', () => {
    expect(toTrimmedString(undefined)).toBe('');
    expect(toTrimmedString(null)).toBe('');
    expect(toTrimmedString('  頭痛  ')).toBe('頭痛');
  });

  it('toRubyFloat は先頭の数値を読み、読めなければ 0', () => {
    expect(toRubyFloat('1700000000000.5')).toBe(1700000000000.5);
    expect(toRubyFloat('abc')).toBe(0);
    expect(toRubyFloat(undefined)).toBe(0);
  });
});

describe('Cookie', () => {
  it('指定名の値を取り出す', () => {
    expect(readCookie('a=1; clinic_session_id=abc-123; b=2', 'clinic_session_id')).toBe('abc-123');
    expect(readCookie('a=1', 'clinic_session_id')).toBeNull();
    expect(readCookie(null, 'clinic_session_id')).toBeNull();
  });

  it('セッション Cookie は HttpOnly・SameSite=Lax・本番のみ Secure', () => {
    const dev = buildSessionCookie('clinic_session_id', 'x', 86400, false);
    const prod = buildSessionCookie('clinic_session_id', 'x', 86400, true);
    expect(dev).toContain('HttpOnly');
    expect(dev).toContain('SameSite=Lax');
    expect(dev).not.toContain('Secure');
    expect(prod).toContain('Secure');
  });
});
