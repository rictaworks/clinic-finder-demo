export interface Area {
  id: number
  name: string
  en_name: string
}

export interface Department {
  id: number
  name: string
}

export interface Clinic {
  id: number
  name: string
  address: string
  phone_display: string
  rating: number
  open_time: string
  close_time: string
  area: Area
  departments: Department[]
}

export interface Slot {
  id: number
  slot_date: string
  slot_time: string
  status: 'open' | 'reserved'
}

export interface ClinicDetail extends Clinic {
  slots: Slot[]
}

export interface Reservation {
  id: number
  clinic: Clinic
  slot: Slot
  age_group: string
  symptom_note: string
  status: 'pending' | 'cancelled'
  reserved_at: string
}

export interface SearchResult {
  clinic: Clinic
  score: number
  available_slots_count: number
}

export interface SearchParams {
  symptom: string
  area: string
  has_slot?: boolean
}

export interface ReservationData {
  clinic_id: number
  slot_id: number
  age_group: string
  symptom_note: string
  website: string
  submitted_at: number
}
