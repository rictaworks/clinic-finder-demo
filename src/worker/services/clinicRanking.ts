import { RANKING } from '../config/constants';

export interface RankableClinic {
  id: number;
  rating: number | null;
}

export interface RankingInput<C extends RankableClinic> {
  clinics: C[];
  /** 症状から決まった診療科の ID（優先度順）。 */
  departmentIds: number[];
  /** 診療科 ID の一覧（clinic_id -> department_id[]）。 */
  clinicDepartmentIds: Map<number, number[]>;
  /** 今日〜+6 日の open 枠数（clinic_id -> 件数）。 */
  openSlotCounts: Map<number, number>;
  hasSlot: boolean;
}

export interface RankedClinic<C extends RankableClinic> {
  clinic: C;
  score: number;
  availableSlotsCount: number;
}

/** 診療科の一致度。症状の先頭の診療科に一致すれば 40 点、2 番目 25 点、以降 10 点。 */
export function departmentScore(departmentIds: number[], clinicDepartmentIds: number[]): number {
  for (const [index, departmentId] of departmentIds.entries()) {
    if (clinicDepartmentIds.includes(departmentId)) {
      if (index === 0) {
        return RANKING.DEPT_SCORE_FIRST;
      }
      if (index === 1) {
        return RANKING.DEPT_SCORE_SECOND;
      }
      return RANKING.DEPT_SCORE_OTHER;
    }
  }
  return 0;
}

/**
 * Rails 版 ClinicFilter と同じ採点・並び順。
 * 同点は clinic.id の昇順で安定させる（Rails の sort_by は同点の順序が未定義だった）。
 */
export function rankClinics<C extends RankableClinic>(input: RankingInput<C>): RankedClinic<C>[] {
  const counts = input.openSlotCounts;
  const highestCount = Math.max(0, ...input.clinics.map((clinic) => counts.get(clinic.id) ?? 0));
  const maxSlots = highestCount > 0 ? highestCount : 1;

  const ranked: RankedClinic<C>[] = [];
  for (const clinic of input.clinics) {
    const slotCount = counts.get(clinic.id) ?? 0;
    if (input.hasSlot && slotCount === 0) {
      continue;
    }
    const deptScore = departmentScore(input.departmentIds, input.clinicDepartmentIds.get(clinic.id) ?? []);
    const slotScore = Math.round((slotCount / maxSlots) * RANKING.SLOT_SCORE_MAX);
    const ratingScore = Math.round((clinic.rating ?? 0) * RANKING.RATING_MULTIPLIER);
    ranked.push({ clinic, score: deptScore + slotScore + ratingScore, availableSlotsCount: slotCount });
  }
  return ranked.sort((a, b) => b.score - a.score || a.clinic.id - b.clinic.id);
}
