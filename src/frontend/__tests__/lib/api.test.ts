import { api } from '@/lib/api'

global.fetch = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
})

describe('api.createSession', () => {
  it('POST /api/sessions を呼び出す', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ session_id: 'abc' }) })
    await api.createSession()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sessions'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('api.search', () => {
  it('POST /api/search を正しいボディで呼び出す', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [] })
    await api.search({ symptom: '頭痛', area: '渋谷', has_slot: true })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ symptom: '頭痛', area: '渋谷', has_slot: true }),
      })
    )
  })
})

describe('api.cancelReservation', () => {
  it('DELETE /api/reservations/:id を呼び出す', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
    await api.cancelReservation(5)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reservations/5'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
