import { numberedPlaceholders, selectAll, selectFirst } from '../lib/d1';

export interface ClinicRow {
  id: number;
  name: string;
  area_id: number;
  area_name: string;
  area_en_name: string | null;
  address: string | null;
  phone_display: string | null;
  rating: number | null;
  open_time: string | null;
  close_time: string | null;
}

export interface ClinicDepartmentRow {
  clinic_id: number;
  department_id: number;
  department_name: string;
}

const CLINIC_COLUMNS = `
  c.id, c.name, c.area_id, a.name AS area_name, a.en_name AS area_en_name,
  c.address, c.phone_display, c.rating, c.open_time, c.close_time`;

export class ClinicRepository {
  constructor(private readonly db: D1Database) {}

  findById(clinicId: number): Promise<ClinicRow | null> {
    return selectFirst<ClinicRow>(
      this.db,
      `SELECT ${CLINIC_COLUMNS} FROM clinics AS c INNER JOIN areas AS a ON a.id = c.area_id WHERE c.id = ?1`,
      [clinicId],
    );
  }

  /** 地域で絞り込む（areaId が null なら全件）。 */
  listByArea(areaId: number | null): Promise<ClinicRow[]> {
    return selectAll<ClinicRow>(
      this.db,
      `SELECT ${CLINIC_COLUMNS} FROM clinics AS c INNER JOIN areas AS a ON a.id = c.area_id
       WHERE (?1 IS NULL OR c.area_id = ?1) ORDER BY c.id`,
      [areaId],
    );
  }

  async listDepartmentsForClinics(clinicIds: number[]): Promise<ClinicDepartmentRow[]> {
    if (clinicIds.length === 0) {
      return [];
    }
    return selectAll<ClinicDepartmentRow>(
      this.db,
      `SELECT cd.clinic_id, cd.department_id, d.name AS department_name
       FROM clinic_departments AS cd INNER JOIN departments AS d ON d.id = cd.department_id
       WHERE cd.clinic_id IN (${numberedPlaceholders(clinicIds.length)})
       ORDER BY cd.clinic_id, d.id`,
      clinicIds,
    );
  }
}
