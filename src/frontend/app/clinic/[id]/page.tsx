'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faSpinner, faPhone, faLocationDot, faClock } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import StarRating from '@/components/StarRating'
import SlotCalendar from '@/components/SlotCalendar'
import ReservationModal from '@/components/ReservationModal'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES } from '@/lib/constants'
import type { ClinicDetail, Slot } from '@/types'

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

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--border-default)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '16px',
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  fontSize: '14px',
  color: 'var(--text-secondary)',
}

export default function ClinicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clinicId = Number(params.id)

  const [clinic, setClinic] = useState<ClinicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    api
      .getClinic(clinicId)
      .then((res) => {
        if (!res.ok) throw new Error(`Clinic fetch failed: ${res.status}`)
        return res.json()
      })
      .then((data: ClinicDetail) => {
        setClinic(data)
      })
      .catch(() => {
        setError(ERROR_MESSAGES.NETWORK)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [clinicId])

  function handleSelectSlot(slot: Slot) {
    setSelectedSlot(slot)
    setIsModalOpen(true)
  }

  async function handleConfirmReservation(ageGroup: string, symptomNote: string, submittedAt: number) {
    if (!selectedSlot) return
    const res = await api.createReservation({
      clinic_id: clinicId,
      slot_id: selectedSlot.id,
      age_group: ageGroup,
      symptom_note: symptomNote,
      website: '',
      submitted_at: submittedAt,
    })
    if (res.status === 409) {
      throw new Error(ERROR_MESSAGES.SLOT_CONFLICT)
    }
    if (res.status === 422) {
      throw new Error(ERROR_MESSAGES.DOUBLE_BOOKING)
    }
    if (!res.ok) {
      throw new Error(ERROR_MESSAGES.GENERAL)
    }
    const data = await res.json()
    setIsModalOpen(false)
    router.push(`/reservations/${data.id}`)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-navy-500)', fontSize: '28px' }} />
      </div>
    )
  }

  if (error || !clinic) {
    return (
      <div style={{ paddingTop: '16px' }}>
        <Link href="/" style={backLinkStyle}>
          <FontAwesomeIcon icon={faChevronLeft} />
          検索に戻る
        </Link>
        <div style={{ marginTop: '16px' }}>
          <ErrorMessage message={error || ERROR_MESSAGES.GENERAL} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '16px' }}>
      {/* 戻るヘッダー */}
      <div style={{
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px',
      }}>
        <Link href="/search" style={backLinkStyle}>
          <FontAwesomeIcon icon={faChevronLeft} />
          検索結果に戻る
        </Link>
      </div>

      {/* クリニック情報カード */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{clinic.name}</h1>
          <StarRating rating={clinic.rating} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={metaRowStyle}>
            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--color-navy-500)', marginTop: '2px', flexShrink: 0 }} />
            <span>{clinic.area.name} — {clinic.address}</span>
          </div>
          <div style={metaRowStyle}>
            <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--color-navy-500)', flexShrink: 0 }} />
            <span>{clinic.phone_display}</span>
          </div>
          <div style={metaRowStyle}>
            <FontAwesomeIcon icon={faClock} style={{ color: 'var(--color-navy-500)', flexShrink: 0 }} />
            <span>{clinic.open_time} 〜 {clinic.close_time}</span>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            対応診療科
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {clinic.departments.map((dept) => (
              <span key={dept.id} style={{
                padding: '4px 10px',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
              }}>
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* スロットカード */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          直近7日間の空き枠
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
          「予約する」ボタンをクリックして予約枠を選択してください
        </p>
        <SlotCalendar slots={clinic.slots} onSelectSlot={handleSelectSlot} />
      </div>

      {selectedSlot && (
        <ReservationModal
          isOpen={isModalOpen}
          clinic={clinic}
          slot={selectedSlot}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmReservation}
        />
      )}
    </div>
  )
}
