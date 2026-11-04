import { writeLog } from '../lib/logger';
import { slotWindow } from '../lib/time';
import type { ClinicRepository } from '../repo/clinicRepository';
import type { SlotRepository } from '../repo/slotRepository';
import { groupDepartments, toClinicJson, toSlotJson, type ClinicJson, type SlotJson } from '../serializers';

export interface ClinicDetailResponse extends ClinicJson {
  slots: SlotJson[];
}

/** クリニック詳細と、今日〜+6 日の枠。 */
export class ClinicService {
  constructor(
    private readonly clinics: ClinicRepository,
    private readonly slots: SlotRepository,
    private readonly clock: () => Date,
  ) {}

  async findDetail(clinicId: number): Promise<ClinicDetailResponse | null> {
    const clinic = await this.clinics.findById(clinicId);
    if (!clinic) {
      writeLog('warn', 'ClinicService', 'clinic not found');
      return null;
    }
    const departments = groupDepartments(await this.clinics.listDepartmentsForClinics([clinic.id])).get(clinic.id) ?? [];
    const window = slotWindow(this.clock());
    const slots = await this.slots.listForClinic(clinic.id, window.from, window.to);
    return { ...toClinicJson(clinic, departments), slots: slots.map(toSlotJson) };
  }
}
