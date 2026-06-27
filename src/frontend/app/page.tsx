'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faLocationDot, faHeartPulse, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useSession } from '@/hooks/useSession'
import ErrorMessage from '@/components/ErrorMessage'
import { HONEYPOT_MIN_INTERVAL_MS } from '@/lib/constants'

export default function HomePage() {
  const router = useRouter()
  const { loading: sessionLoading, error: sessionError } = useSession()
  const [symptom, setSymptom] = useState('')
  const [area, setArea] = useState('')
  const [hasSlot, setHasSlot] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pageLoadedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    pageLoadedAtRef.current = Date.now()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const hpValue = (form.elements.namedItem('hp_field') as HTMLInputElement)?.value
    if (hpValue) {
      setError('フォームの送信が無効です。')
      return
    }
    const elapsed = Date.now() - pageLoadedAtRef.current
    if (elapsed < HONEYPOT_MIN_INTERVAL_MS) {
      setError('フォームの送信が早すぎます。しばらくしてから再試行してください。')
      return
    }
    if (!symptom.trim()) {
      setError('症状を入力してください。')
      return
    }
    if (!area.trim()) {
      setError('地域を入力してください。')
      return
    }

    setError(null)
    setSubmitting(true)

    const params = new URLSearchParams({
      symptom: symptom.trim(),
      area: area.trim(),
      has_slot: String(hasSlot),
      submitted_at: String(pageLoadedAtRef.current),
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">クリニックを探す</h1>
        <p className="text-gray-500">症状・場所・空き枠から最適なクリニックを見つけましょう</p>
      </div>

      {sessionError && (
        <div className="w-full max-w-lg mb-4">
          <ErrorMessage message="セッションの初期化に失敗しました。ページを再読み込みしてください。" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 space-y-5">
        {/* Honeypot field - must be invisible to humans */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }} aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <input type="hidden" name="submitted_at" value={String(pageLoadedAtRef.current)} />

        <div>
          <label htmlFor="symptom" className="block text-sm font-medium text-gray-700 mb-1.5">
            <FontAwesomeIcon icon={faHeartPulse} className="mr-1.5 text-blue-500" />
            どのような症状ですか？
          </label>
          <textarea
            id="symptom"
            name="symptom"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            rows={3}
            placeholder="例：頭痛、発熱、咳が続いている..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1.5">
            <FontAwesomeIcon icon={faLocationDot} className="mr-1.5 text-blue-500" />
            お近くの地域は？
          </label>
          <input
            id="area"
            type="text"
            name="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="例：渋谷、新宿、池袋..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has_slot"
            checked={hasSlot}
            onChange={(e) => setHasSlot(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="has_slot" className="text-sm text-gray-700 cursor-pointer">
            空き枠あり（予約可能）のクリニックのみ表示
          </label>
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={submitting || sessionLoading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting || sessionLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <>
              <FontAwesomeIcon icon={faSearch} />
              クリニックを探す
            </>
          )}
        </button>
      </form>
    </div>
  )
}
