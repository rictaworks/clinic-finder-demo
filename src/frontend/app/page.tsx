'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useSession } from '@/hooks/useSession'
import ErrorMessage from '@/components/ErrorMessage'
import { HONEYPOT_MIN_INTERVAL_MS, AREAS } from '@/lib/constants'

export default function HomePage() {
  const router = useRouter()
  const { loading: sessionLoading, error: sessionError } = useSession()
  const [symptom, setSymptom] = useState('')
  const [area, setArea] = useState('')
  const [hasSlot, setHasSlot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pageLoadedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    pageLoadedAtRef.current = Date.now()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const hpValue = (form.elements.namedItem('website') as HTMLInputElement)?.value
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

    setError(null)
    setSubmitting(true)

    const params = new URLSearchParams({
      symptom: symptom.trim(),
      area: area,
      has_slot: String(hasSlot),
      submitted_at: String(pageLoadedAtRef.current),
    })
    router.push(`/search?${params.toString()}`)
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border-default)',
    borderRadius: '6px',
    padding: '10px 13px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    background: '#fff',
    outline: 'none',
    width: '100%',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%232d3e50' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 13px center',
    paddingRight: '34px',
    cursor: 'pointer',
  }

  return (
    <div>
      {/* ヒーロー */}
      <div style={{
        background: 'var(--color-navy-800)',
        borderRadius: '12px',
        padding: '40px 36px',
        marginBottom: '24px',
        marginTop: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: '32px',
          bottom: '-16px',
          fontSize: '120px',
          color: 'rgba(255,255,255,0.03)',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>✦</div>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-navy-300)', marginBottom: '12px' }}>
          Clinic Finder — Demo
        </p>
        <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 600, lineHeight: 1.3, color: '#fff', marginBottom: '10px' }}>
          症状・場所から<br />最適なクリニックを
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-navy-400)', lineHeight: 1.65 }}>
          東京都内10エリア・20クリニック対応のデモアプリ。症状キーワードから診療科を自動判定します。
        </p>
      </div>

      {/* 検索フォーム */}
      {sessionError && (
        <div style={{ marginBottom: '16px' }}>
          <ErrorMessage message="セッションの初期化に失敗しました。ページを再読み込みしてください。" />
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'var(--surface-default)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* ハニーポット */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }} aria-hidden="true">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="submitted_at" value={String(pageLoadedAtRef.current)} />

        {/* 症状 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label htmlFor="symptom" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            症状を入力
          </label>
          <input
            id="symptom"
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="例：発熱、腹痛、頭痛、腰痛"
            style={inputStyle}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            キーワードを入力すると対応診療科を自動で判定します（複数可）
          </p>
        </div>

        {/* エリア */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <label htmlFor="area" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            エリアを選択
          </label>
          <select
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            style={selectStyle}
          >
            <option value="">すべてのエリア</option>
            {AREAS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        {/* 空き枠フィルタ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <input
            type="checkbox"
            id="slot_filter"
            checked={hasSlot}
            onChange={(e) => setHasSlot(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-navy-700)', flexShrink: 0 }}
          />
          <label htmlFor="slot_filter" style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            空き枠があるクリニックのみ表示する
          </label>
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={submitting || sessionLoading}
          style={{
            background: submitting || sessionLoading ? 'var(--color-neutral-300)' : 'var(--color-navy-700)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: submitting || sessionLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            width: '100%',
          }}
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
