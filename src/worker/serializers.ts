import type { ClinicRow, ClinicDepartmentRow } from './repo/clinicRepository';
import type { ReservationRow } from './repo/reservationRepository';
import type { SlotRow } from './repo/slotRepository';

/** 診療科の JSON（Rails 版 { id, name }）。 */
export interface DepartmentJson {
  id: number;
  name: string;
}

/** クリニックの JSON（検索結果・詳細・予約確認で共通）。 */
export interface ClinicJson {
  id: number;
  name: string;
  address: string | null;
  phone_display: string | null;
  rating: number | null;
  open_time: string | null;
  close_time: string | null;
  area: { id: number; name: string; en_name: string | null };
  departments: DepartmentJson[];
}

export interface SlotJson {
  id: number;
  slot_date: string;
  slot_time: string;
  status: string;
  capacity: number;
}

export interface ReservationJson {
  id: number;
  clinic: ClinicJson;
  slot: { id: number; slot_date: string; slot_time: string; status: string };
  age_group: string;
  symptom_note: string | null;
  status: string;
  reserved_at: string | null;
}

/** 診療科の一覧を clinic_id ごとに束ねる。 */
export function groupDepartments(rows: ClinicDepartmentRow[]): Map<number, DepartmentJson[]> {
  const grouped = new Map<number, DepartmentJson[]>();
  for (const row of rows) {
    const list = grouped.get(row.clinic_id) ?? [];
    list.push({ id: row.department_id, name: row.department_name });
    grouped.set(row.clinic_id, list);
  }
  return grouped;
}

export function toClinicJson(row: ClinicRow, departments: DepartmentJson[]): ClinicJson {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone_display: row.phone_display,
    rating: row.rating,
    open_time: row.open_time,
    close_time: row.close_time,
    area: { id: row.area_id, name: row.area_name, en_name: row.area_en_name },
    departments,
  };
}

export function toSlotJson(row: SlotRow): SlotJson {
  return {
    id: row.id,
    slot_date: row.slot_date,
    slot_time: row.slot_time,
    status: row.status,
    capacity: row.capacity,
  };
}

export function toReservationJson(
  row: ReservationRow,
  clinic: ClinicJson,
  slot: SlotRow,
): ReservationJson {
  return {
    id: row.id,
    clinic,
    slot: { id: slot.id, slot_date: slot.slot_date, slot_time: slot.slot_time, status: slot.status },
    age_group: row.age_group,
    symptom_note: row.symptom_note,
    status: row.status,
    reserved_at: row.reserved_at,
  };
}
