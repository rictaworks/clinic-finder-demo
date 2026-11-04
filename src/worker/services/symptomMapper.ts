import type { MasterRepository, DepartmentRow } from '../repo/masterRepository';
import { writeLog } from '../lib/logger';

const WORD_SEPARATOR = /[\s、,]+/;
const FULLWIDTH_ASCII = /[！-～]/g;
const FULLWIDTH_OFFSET = 0xfee0;

/** Rails 版 SymptomMapper#normalize と同じ順序（NFKC → 小文字 → 全角英数の半角化 → trim）。 */
export function normalizeSymptomText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(FULLWIDTH_ASCII, (character) => String.fromCharCode(character.charCodeAt(0) - FULLWIDTH_OFFSET))
    .trim();
}

/**
 * 症状の文字列から診療科を優先度順に返す。
 * 全体一致が無いときだけ、空白・読点・カンマで分けた語ごとに一致を探す。
 */
export class SymptomMapper {
  constructor(private readonly master: MasterRepository) {}

  async map(text: string): Promise<DepartmentRow[]> {
    const normalized = normalizeSymptomText(text);
    if (normalized === '') {
      return [];
    }
    let departmentIds = await this.master.findDepartmentIdsBySymptomTerms([normalized]);
    if (departmentIds.length === 0) {
      const words = normalized.split(WORD_SEPARATOR).filter((word) => word !== '');
      departmentIds = await this.master.findDepartmentIdsBySymptomTerms(words);
    }
    const uniqueIds = [...new Set(departmentIds)];
    const departments = await this.master.findDepartmentsByIds(uniqueIds);
    const byId = new Map(departments.map((department) => [department.id, department]));
    const ranked = uniqueIds.flatMap((id) => {
      const department = byId.get(id);
      return department ? [department] : [];
    });
    writeLog('info', 'SymptomMapper', 'mapped', { departmentCount: ranked.length });
    return ranked;
  }
}
