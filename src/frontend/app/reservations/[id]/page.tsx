'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSpinner, faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import ConfirmModal from '@/components/ConfirmModal'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES, AGE_GROUPS } from '@/lib/constants'
import type { Reservation } from '@/types'

function findAgeGroupLabel(value: string): string {
  const found = AGE_GROUPS.find((g) => g.value === value)
  return found ? found.label : value
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
      <div className="flex justify-center py-16">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl" />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} />
          トップに戻る
        </Link>
        <ErrorMessage message={error || ERROR_MESSAGES.GENERAL} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
          トップに戻る
        </Link>
      </div>

      {cancelDone && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
          <FontAwesomeIcon icon={faXmarkCircle} className="text-gray-500" />
          <span>予約がキャンセルされました。</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className={reservation.status === 'pending' ? 'text-green-500 text-xl' : 'text-gray-400 text-xl'}
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {reservation.status === 'pending' ? '予約確認' : 'キャンセル済み'}
          </h1>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex gap-4">
            <span className="w-28 text-gray-500 flex-shrink-0">クリニック名</span>
            <span className="font-medium text-gray-900">{reservation.clinic.name}</span>
          </div>
          <div className="flex gap-4">
            <span className="w-28 text-gray-500 flex-shrink-0">予約日時</span>
            <span className="font-medium text-gray-900">
              {reservation.slot.slot_date} {reservation.slot.slot_time}
            </span>
          </div>
          <div className="flex gap-4">
            <span className="w-28 text-gray-500 flex-shrink-0">年齢層</span>
            <span className="font-medium text-gray-900">{findAgeGroupLabel(reservation.age_group)}</span>
          </div>
          {reservation.symptom_note && (
            <div className="flex gap-4">
              <span className="w-28 text-gray-500 flex-shrink-0">症状メモ</span>
              <span className="text-gray-700">{reservation.symptom_note}</span>
            </div>
          )}
          <div className="flex gap-4">
            <span className="w-28 text-gray-500 flex-shrink-0">ステータス</span>
            <span className={`font-medium ${reservation.status === 'pending' ? 'text-green-600' : 'text-gray-500'}`}>
              {reservation.status === 'pending' ? '仮予約中' : 'キャンセル済み'}
            </span>
          </div>
        </div>

        {reservation.status === 'pending' && !cancelDone && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsConfirmOpen(true)}
              disabled={cancelLoading}
              className="px-6 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {cancelLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'キャンセルする'}
            </button>
          </div>
        )}
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
