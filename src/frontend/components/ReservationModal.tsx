'use client'

import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">予約する</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="閉じる">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              <strong>{clinic.name}</strong><br />
              {slot.slot_date} {slot.slot_time}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">年齢層 <span className="text-red-500">*</span></p>
            <div className="space-y-2">
              {AGE_GROUPS.map((group) => (
                <label key={group.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="age_group"
                    value={group.value}
                    checked={ageGroup === group.value}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="symptom_note" className="block text-sm font-medium text-gray-700 mb-1">
              症状メモ（任意）
            </label>
            <textarea
              id="symptom_note"
              value={symptomNote}
              onChange={(e) => setSymptomNote(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="症状の詳細をご記入ください..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-60"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : '予約を確定する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
