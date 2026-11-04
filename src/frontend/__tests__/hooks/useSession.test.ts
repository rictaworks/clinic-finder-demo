import { renderHook, act } from '@testing-library/react'
import { useSession } from '@/hooks/useSession'

global.fetch = jest.fn()

beforeEach(() => {
  jest.resetAllMocks()
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  })
})

describe('useSession', () => {
  it('既存のCookieがある場合はAPIを呼ばない', async () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'clinic_session_id=existing-id',
    })
    const { result } = renderHook(() => useSession())
    await act(async () => {})
    expect(result.current.ready).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('Cookieがない場合はPOST /api/sessions を呼び、本文を読まずに ready にする', async () => {
    const json = jest.fn()
    ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json })
    const { result } = renderHook(() => useSession())
    await act(async () => {})
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sessions'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(json).not.toHaveBeenCalled()
    expect(result.current.ready).toBe(true)
  })

  it('APIエラー時にerrorをセットし、readyにはしない', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSession())
    await act(async () => {})
    expect(result.current.error).toBeTruthy()
    expect(result.current.ready).toBe(false)
  })
})
