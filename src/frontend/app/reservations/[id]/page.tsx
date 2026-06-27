'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import ConfirmModal from '@/components/ConfirmModal'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES, AGE_GROUPS } from '@/lib/constants'
import type { Reservation } from '@/types'

function findAgeGroupLabel(value: string): string {
  const found = AGE_GROUPS.find((g) => g.value === value)
  return found ? found.label : value
}

const backLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-tertiary)',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: 0,
  textDecoration: 'none',
}

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  fontSize: '14px',
}

export default function ReservationPage() {
  const params = useParams()
  const reservationId = Number(params.id)

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  useEffect(() => {
    api
      .getReservation(reservationId)
      .then((res) => {
        if (!res.ok) throw new Error(`Reservation fetch failed: ${res.status}`)
        return res.json()
      })
      .then((data: Reservation) => {
        setReservation(data)
      })
      .catch(() => {
        setError(ERROR_MESSAGES.NETWORK)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [reservationId])

  async function handleCancel() {
    setIsConfirmOpen(false)
    setCancelLoading(true)
    try {
      const res = await api.cancelReservation(reservationId)
      if (!res.ok) throw new Error(`Cancel failed: ${res.status}`)
      setCancelDone(true)
      setReservation((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
    } catch {
      setError(ERROR_MESSAGES.GENERAL)
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-navy-500)', fontSize: '28px' }} />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div style={{ paddingTop: '16px' }}>
        <Link href="/" style={backLinkStyle}>トップに戻る</Link>
        <div style={{ marginTop: '16px' }}>
          <ErrorMessage message={error || ERROR_MESSAGES.GENERAL} />
        </div>
      </div>
    )
  }

  const isCancelled = reservation.status === 'cancelled' || cancelDone

  return (
    <div style={{ paddingTop: '16px' }}>
      {/* 完了 / キャンセル完了カード */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px 24px',
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px', color: isCancelled ? 'var(--text-tertiary)' : 'var(--color-navy-600)' }}>
          <FontAwesomeIcon icon={isCancelled ? faCircleXmark : faCircleCheck} />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {isCancelled ? '予約をキャンセルしました' : '予約が完了しました'}
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
          予約ID: {reservation.id}
        </div>

        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={detailRowStyle}>
            <span style={{ color: 'var(--text-tertiary)', width: '80px', flexShrink: 0 }}>クリニック</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{reservation.clinic.name}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: 'var(--text-tertiary)', width: '80px', flexShrink: 0 }}>エリア</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{reservation.clinic.area.name}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: 'var(--text-tertiary)', width: '80px', flexShrink: 0 }}>日時</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {reservation.slot.slot_date}　{reservation.slot.slot_time}
            </span>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: 'var(--text-tertiary)', width: '80px', flexShrink: 0 }}>年齢層</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{findAgeGroupLabel(reservation.age_group)}</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '20px', lineHeight: 1.6, textAlign: 'left' }}>
          ※ このデモ版の予約データはJST 03:00に自動リセットされます。実際の受診については各クリニックへ直接お問い合わせください。
        </p>
      </div>

      {/* ボタン群 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isCancelled && (
          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={cancelLoading}
            style={{
              background: 'transparent',
              color: '#c84030',
              border: '1px solid #c84030',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: cancelLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
            }}
          >
            {cancelLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'この予約をキャンセルする'}
          </button>
        )}
        <Link href="/" style={{
          background: '#fff',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '12px 24px',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          textDecoration: 'none',
        }}>
          トップに戻る
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="予約のキャンセル"
        message="本当にキャンセルしますか？この操作は取り消せません。"
        confirmLabel="キャンセルする"
        cancelLabel="戻る"
        onConfirm={handleCancel}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
