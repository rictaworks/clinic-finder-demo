import { numberedPlaceholders, selectAll } from '../lib/d1';

export interface AreaRow {
  id: number;
  name: string;
  kana: string | null;
  en_name: string | null;
  aliases: string | null;
}

export interface DepartmentRow {
  id: number;
  name: string;
}

/** 地域・診療科・症状のマスタ（変更されない参照データ）。 */
export class MasterRepository {
  constructor(private readonly db: D1Database) {}

  listAreas(): Promise<AreaRow[]> {
    return selectAll<AreaRow>(this.db, 'SELECT id, name, kana, en_name, aliases FROM areas ORDER BY id');
  }

  async findDepartmentsByIds(ids: number[]): Promise<DepartmentRow[]> {
    if (ids.length === 0) {
      return [];
    }
    return selectAll<DepartmentRow>(
      this.db,
      `SELECT id, name FROM departments WHERE id IN (${numberedPlaceholders(ids.length)})`,
      ids,
    );
  }

  /**
   * いずれかの語を含む症状の診療科 ID を、優先度順で返す（同順位は id 順）。
   * LIKE は使わない（D1 は長い入力で「pattern too complex」を返すため）。instr の部分一致で判定する。
   * 語は呼び出し側で小文字化して渡す（DB 側も lower() で揃える）。
   */
  async findDepartmentIdsBySymptomTerms(terms: string[]): Promise<number[]> {
    if (terms.length === 0) {
      return [];
    }
    const conditions = terms.map((_, index) => `instr(lower(normalized), ?${index + 1}) > 0`).join(' OR ');
    const rows = await selectAll<{ department_id: number }>(
      this.db,
      `SELECT department_id FROM symptoms WHERE ${conditions} ORDER BY priority, id`,
      terms,
    );
    return rows.map((row) => row.department_id);
  }
}
