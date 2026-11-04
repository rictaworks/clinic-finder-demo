import { ClinicRepository } from './repo/clinicRepository';
import { MasterRepository } from './repo/masterRepository';
import { ReservationRepository } from './repo/reservationRepository';
import { SlotRepository } from './repo/slotRepository';
import { ClinicService } from './services/clinicService';
import { LocationResolver } from './services/locationResolver';
import { ReservationService } from './services/reservationService';
import { SearchService } from './services/searchService';
import { SymptomMapper } from './services/symptomMapper';

/** リクエストごとに組み立てるサービス群。D1 の参照だけを持ち、状態は持たない。 */
export function createServices(db: D1Database, clock: () => Date = () => new Date()) {
  const master = new MasterRepository(db);
  const clinics = new ClinicRepository(db);
  const slots = new SlotRepository(db);
  const reservations = new ReservationRepository(db);
  return {
    search: new SearchService(new SymptomMapper(master), new LocationResolver(master), clinics, slots, clock),
    clinic: new ClinicService(clinics, slots, clock),
    reservation: new ReservationService(reservations, slots, clinics, clock),
  };
}
