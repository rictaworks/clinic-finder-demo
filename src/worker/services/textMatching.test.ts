import { describe, expect, it } from 'vitest';
import { matchArea, normalizeLocationText } from './locationResolver';
import { normalizeSymptomText } from './symptomMapper';

const AREAS = [
  { id: 1, name: '渋谷', kana: 'シブヤ', en_name: 'shibuya', aliases: '渋谷区,しぶや' },
  { id: 2, name: '新宿', kana: 'シンジュク', en_name: 'shinjuku', aliases: '新宿区,しんじゅく' },
];

describe('normalizeSymptomText（Rails 版 SymptomMapper#normalize）', () => {
  it('全角英数を半角にし、小文字化して前後の空白を除く', () => {
    expect(normalizeSymptomText('  ＨＥＡＤＡＣＨＥ１ ')).toBe('headache1');
  });

  it('NFKC 正規化を行う（半角カナ→全角カナ）', () => {
    expect(normalizeSymptomText('ﾄﾞｷﾄﾞｷ')).toBe('ドキドキ');
  });
});


describe('matchArea（Rails 版 LocationResolver と同じ一致規則）', () => {
  it('地域名の完全一致で該当 ID を返す', () => {
    expect(matchArea(AREAS, '渋谷')?.id).toBe(1);
  });

  it('地域名を含む入力（駅名など）も一致する', () => {
    expect(matchArea(AREAS, '新宿駅周辺')?.id).toBe(2);
  });

  it('英語名は大文字小文字を区別せずに一致する', () => {
    expect(matchArea(AREAS, 'SHIBUYA')?.id).toBe(1);
  });

  it('区名・読みの別名でも一致する', () => {
    expect(matchArea(AREAS, '新宿区')?.id).toBe(2);
    expect(matchArea(AREAS, 'しぶや')?.id).toBe(1);
  });

  it('空・一致しない入力は null', () => {
    expect(matchArea(AREAS, '')).toBeNull();
    expect(matchArea(AREAS, '  ')).toBeNull();
    expect(matchArea(AREAS, 'どこか知らない場所')).toBeNull();
  });

  it('英語名が空の地域は、どんな入力にも一致しない', () => {
    const areas = [{ id: 9, name: '銀座', kana: null, en_name: null, aliases: null }];
    expect(matchArea(areas, '上野')).toBeNull();
  });

  it('normalizeLocationText は NFKC と trim のみ行う', () => {
    expect(normalizeLocationText(' ＳＨＩＢＵＹＡ ')).toBe('SHIBUYA');
  });
});
