import { describe, expect, it } from 'vitest';
import { departmentScore, rankClinics } from './clinicRanking';

describe('departmentScore', () => {
  it('症状の先頭の診療科に一致すれば 40 点', () => {
    expect(departmentScore([1, 2, 3], [1])).toBe(40);
  });

  it('2 番目の診療科に一致すれば 25 点、それ以降は 10 点', () => {
    expect(departmentScore([1, 2, 3], [2])).toBe(25);
    expect(departmentScore([1, 2, 3], [3])).toBe(10);
  });

  it('一致が無ければ 0 点', () => {
    expect(departmentScore([1, 2], [9])).toBe(0);
    expect(departmentScore([], [1])).toBe(0);
  });
});

describe('rankClinics', () => {
  const clinics = [
    { id: 1, rating: 4.0 },
    { id: 2, rating: 4.5 },
    { id: 3, rating: 3.0 },
  ];

  it('診療科・空き枠・評価で採点し、点の高い順に並べる', () => {
    const ranked = rankClinics({
      clinics,
      departmentIds: [7],
      clinicDepartmentIds: new Map([
        [1, [7]],
        [2, [8]],
        [3, [9]],
      ]),
      openSlotCounts: new Map([
        [1, 2],
        [2, 4],
        [3, 0],
      ]),
      hasSlot: false,
    });
    // clinic 1: 40 + round(2/4*30)=15 + round(4.0*6)=24 → 79
    // clinic 2: 0 + 30 + 27 → 57
    // clinic 3: 0 + 0 + 18 → 18
    expect(ranked.map((item) => [item.clinic.id, item.score])).toEqual([
      [1, 79],
      [2, 57],
      [3, 18],
    ]);
  });

  it('hasSlot のとき、空き枠が 0 のクリニックを除外する', () => {
    const ranked = rankClinics({
      clinics,
      departmentIds: [],
      clinicDepartmentIds: new Map(),
      openSlotCounts: new Map([[2, 1]]),
      hasSlot: true,
    });
    expect(ranked.map((item) => item.clinic.id)).toEqual([2]);
  });

  it('同点は id の昇順（安定した並び）', () => {
    const ranked = rankClinics({
      clinics: [
        { id: 5, rating: 4.0 },
        { id: 2, rating: 4.0 },
      ],
      departmentIds: [],
      clinicDepartmentIds: new Map(),
      openSlotCounts: new Map(),
      hasSlot: false,
    });
    expect(ranked.map((item) => item.clinic.id)).toEqual([2, 5]);
  });

  it('全クリニックの空き枠が 0 なら枠の点は 0（分母は 1 として扱う）', () => {
    const ranked = rankClinics({
      clinics: [{ id: 1, rating: null }],
      departmentIds: [],
      clinicDepartmentIds: new Map(),
      openSlotCounts: new Map(),
      hasSlot: false,
    });
    expect(ranked[0]?.score).toBe(0);
    expect(ranked[0]?.availableSlotsCount).toBe(0);
  });
});
