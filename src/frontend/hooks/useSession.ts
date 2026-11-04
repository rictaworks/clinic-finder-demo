'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const SESSION_COOKIE_NAME = 'clinic_session_id'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 匿名セッションの発行。セッション ID は HttpOnly の Cookie だけで扱い、JavaScript には渡さない。
 * ready が true になったら、以後の API 呼び出しは Cookie によって同じセッションとして扱われる。
 */
export function useSession(): { ready: boolean; loading: boolean; error: string | null } {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (getCookie(SESSION_COOKIE_NAME)) {
      setReady(true)
      setLoading(false)
      return
    }

    api
      .createSession()
      .then((res) => {
        if (!res.ok) throw new Error(`Session creation failed: ${res.status}`)
        setReady(true)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { ready, loading, error }
}
