const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

import type { SearchParams, ReservationData } from '@/types'

export const api = {
  createSession: (): Promise<Response> =>
    fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }),

  search: (params: SearchParams): Promise<Response> =>
    fetch(`${API_BASE}/api/search`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),

  getClinic: (id: number): Promise<Response> =>
    fetch(`${API_BASE}/api/clinics/${id}`, {
      credentials: 'include',
    }),

  createReservation: (data: ReservationData): Promise<Response> =>
    fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getReservation: (id: number): Promise<Response> =>
    fetch(`${API_BASE}/api/reservations/${id}`, {
      credentials: 'include',
    }),

  cancelReservation: (id: number): Promise<Response> =>
    fetch(`${API_BASE}/api/reservations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
}
