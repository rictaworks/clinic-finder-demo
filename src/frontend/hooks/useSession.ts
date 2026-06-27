'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const SESSION_COOKIE_NAME = 'clinic_session_id'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function useSession(): { sessionId: string | null; loading: boolean; error: string | null } {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const existing = getCookie(SESSION_COOKIE_NAME)
    if (existing) {
      setSessionId(existing)
      setLoading(false)
      return
    }

    api
      .createSession()
      .then((res) => {
        if (!res.ok) throw new Error(`Session creation failed: ${res.status}`)
        return res.json()
      })
      .then((data: { session_id: string }) => {
        setSessionId(data.session_id)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { sessionId, loading, error }
}
