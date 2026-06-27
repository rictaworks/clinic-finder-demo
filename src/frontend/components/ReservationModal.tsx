'use client'

import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faSpinner, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import { AGE_GROUPS, ERROR_MESSAGES, HONEYPOT_MIN_INTERVAL_MS } from '@/lib/constants'
import type { Slot, Clinic } from '@/types'

interface ReservationModalProps {
  isOpen: boolean
  clinic: Clinic
  slot: Slot
  onClose: () => void
  onConfirm: (ageGroup: string, symptomNote: string, submittedAt: number) => Promise<void>
}

export default function ReservationModal({
  isOpen,
  clinic,
  slot,
  onClose,
  onConfirm,
}: ReservationModalProps) {
  const [ageGroup, setAgeGroup] = useState('')
  const [symptomNote, setSymptomNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const openedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now()
      setAgeGroup('')
      setSymptomNote('')
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const hpValue = (form.elements.namedItem('website') as HTMLInputElement)?.value
    if (hpValue) {
      setError(ERROR_MESSAGES.HONEYPOT)
      return
    }
    const elapsed = Date.now() - openedAtRef.current
    if (elapsed < HONEYPOT_MIN_INTERVAL_MS) {
      setError(ERROR_MESSAGES.HONEYPOT)
      return
    }
    if (!ageGroup) {
      setError('年齢層を選択してください。')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onConfirm(ageGroup, symptomNote, openedAtRef.current)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.GENERAL
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    display: 'block',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '440px' }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 id="modal-title" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>予約フォーム</h2>
          <button onClick={onClose} aria-label="閉じる" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ハニーポット */}
          <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          {/* 予約内容確認 */}
          <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              予約内容の確認
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-tertiary)', width: '70px', flexShrink: 0 }}>クリニック</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{clinic.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-tertiary)', width: '70px', flexShrink: 0 }}>日時</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{slot.slot_date}　{slot.slot_time}</span>
            </div>
          </div>

          {/* 年齢層 */}
          <div>
            <span style={labelStyle}>
              年齢層 <span style={{ color: '#c84030', fontWeight: 400, fontSize: '12px' }}>必須</span>
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {AGE_GROUPS.map((group) => (
                <label key={group.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <input
                    type="radio"
                    name="age_group"
                    value={group.value}
                    checked={ageGroup === group.value}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    style={{ accentColor: 'var(--color-navy-700)' }}
                  />
                  {group.label}
                </label>
              ))}
            </div>
          </div>

          {/* 症状メモ */}
          <div>
            <label htmlFor="symptom_note" style={labelStyle}>
              症状メモ <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '12px' }}>任意・100字以内</span>
            </label>
            <textarea
              id="symptom_note"
              value={symptomNote}
              onChange={(e) => setSymptomNote(e.target.value)}
              maxLength={100}
              placeholder="具体的な症状をお聞かせください"
              style={{
                width: '100%',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                padding: '10px 13px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                background: '#fff',
                outline: 'none',
                resize: 'vertical',
                minHeight: '88px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#c84030', background: '#fff5f5', border: '1px solid #f5c2c2', borderRadius: '6px', padding: '10px 14px' }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--color-neutral-300)' : 'var(--color-navy-700)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '9px',
              width: '100%',
            }}
          >
            {loading
              ? <FontAwesomeIcon icon={faSpinner} spin />
              : <><FontAwesomeIcon icon={faCalendarCheck} /> 予約を確定する</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
