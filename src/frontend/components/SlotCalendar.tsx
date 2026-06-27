'use client'

import type { Slot } from '@/types'

interface SlotCalendarProps {
  slots: Slot[]
  onSelectSlot: (slot: Slot) => void
}

function groupSlotsByDate(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = []
    acc[slot.slot_date].push(slot)
    return acc
  }, {})
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdays[d.getDay()]})`
}

export default function SlotCalendar({ slots, onSelectSlot }: SlotCalendarProps) {
  const grouped = groupSlotsByDate(slots)
  const dates = Object.keys(grouped).sort()

  if (dates.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">空き枠がありません</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {dates.map((date) => (
              <th key={date} className="border border-gray-200 px-3 py-2 bg-gray-50 text-center font-medium text-gray-700">
                {formatDate(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {dates.map((date) => (
              <td key={date} className="border border-gray-200 px-2 py-2 align-top">
                <div className="flex flex-col gap-1">
                  {grouped[date].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.status === 'open' && onSelectSlot(slot)}
                      disabled={slot.status !== 'open'}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        slot.status === 'open'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.slot_time}
                    </button>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
