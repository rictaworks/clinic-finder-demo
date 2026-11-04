import { writeLog } from '../lib/logger';
import { slotWindow } from '../lib/time';
import type { ClinicRepository } from '../repo/clinicRepository';
import type { SlotRepository } from '../repo/slotRepository';
import type { DepartmentRow } from '../repo/masterRepository';
import { groupDepartments, toClinicJson, type ClinicJson, type DepartmentJson } from '../serializers';
import { rankClinics } from './clinicRanking';
import type { LocationResolver } from './locationResolver';
import type { SymptomMapper } from './symptomMapper';

export interface SearchInput {
  symptom: string;
  area: string;
  hasSlot: boolean;
}

export interface SearchResultItem {
  clinic: ClinicJson;
  score: number;
  available_slots_count: number;
}

export interface SearchResponse {
  departments: DepartmentRow[];
  area_id: number | null;
  clinics: SearchResultItem[];
}

export class SearchService {
  constructor(
    private readonly symptomMapper: SymptomMapper,
    private readonly locationResolver: LocationResolver,
    private readonly clinics: ClinicRepository,
    private readonly slots: SlotRepository,
    private readonly clock: () => Date,
  ) {}

  async search(input: SearchInput): Promise<SearchResponse> {
    const departments = await this.symptomMapper.map(input.symptom);
    const areaId = input.area === '' ? null : await this.locationResolver.resolve(input.area);

    const clinicRows = await this.clinics.listByArea(areaId);
    const departmentRows = groupDepartments(
      await this.clinics.listDepartmentsForClinics(clinicRows.map((clinic) => clinic.id)),
    );
    const window = slotWindow(this.clock());
    const openCounts = await this.slots.countOpenByClinic(window.from, window.to);

    const ranked = rankClinics({
      clinics: clinicRows,
      departmentIds: departments.map((department) => department.id),
      clinicDepartmentIds: new Map(
        [...departmentRows.entries()].map(([clinicId, list]) => [clinicId, list.map((department) => department.id)]),
      ),
      openSlotCounts: new Map(openCounts.map((row) => [row.clinic_id, row.open_count])),
      hasSlot: input.hasSlot,
    });

    writeLog('info', 'SearchService', 'searched', {
      departmentCount: departments.length,
      areaMatched: areaId !== null,
      resultCount: ranked.length,
    });

    return {
      departments,
      area_id: areaId,
      clinics: ranked.map((item) => ({
        clinic: toClinicJson(item.clinic, departmentRowsFor(departmentRows, item.clinic.id)),
        score: item.score,
        available_slots_count: item.availableSlotsCount,
      })),
    };
  }
}

function departmentRowsFor(grouped: Map<number, DepartmentJson[]>, clinicId: number): DepartmentJson[] {
  return grouped.get(clinicId) ?? [];
}
