'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSpinner, faPhone, faLocationDot, faClock } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import StarRating from '@/components/StarRating'
import SlotCalendar from '@/components/SlotCalendar'
import ReservationModal from '@/components/ReservationModal'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES } from '@/lib/constants'
import type { ClinicDetail, Slot } from '@/types'

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
      hp_field: '',
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
      <div className="flex justify-center py-16">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl" />
      </div>
    )
  }

  if (error || !clinic) {
    return (
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} />
          検索に戻る
        </Link>
        <ErrorMessage message={error || ERROR_MESSAGES.GENERAL} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
          検索結果に戻る
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
          <StarRating rating={clinic.rating} />
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <span>{clinic.area.name} &mdash; {clinic.address}</span>
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPhone} className="text-blue-500 flex-shrink-0" />
            <span>{clinic.phone_display}</span>
          </p>
          <p className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-blue-500 flex-shrink-0" />
            <span>{clinic.open_time} 〜 {clinic.close_time}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {clinic.departments.map((dept) => (
            <span key={dept.id} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              {dept.name}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">直近7日間の空き枠</h2>
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
