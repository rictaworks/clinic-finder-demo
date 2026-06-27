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
    expect(result.current.sessionId).toBe('existing-id')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('Cookieがない場合はPOST /api/sessions を呼ぶ', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session_id: 'new-session-id' }),
    })
    const { result } = renderHook(() => useSession())
    await act(async () => {})
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sessions'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.current.sessionId).toBe('new-session-id')
  })

  it('APIエラー時にerrorをセットする', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSession())
    await act(async () => {})
    expect(result.current.error).toBeTruthy()
    expect(result.current.sessionId).toBeNull()
  })
})
