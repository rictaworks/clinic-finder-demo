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
      <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>
        空き枠がありません
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {dates.map((date) => (
        <div key={date}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '8px',
          }}>
            {formatDate(date)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {grouped[date].map((slot) => (
              <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{slot.slot_time}</div>
                <button
                  onClick={() => slot.status === 'open' && onSelectSlot(slot)}
                  disabled={slot.status !== 'open'}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: slot.status === 'open' ? '1px solid var(--color-navy-600)' : '1px solid var(--border-default)',
                    background: slot.status === 'open' ? 'var(--color-navy-700)' : 'var(--surface-subtle)',
                    color: slot.status === 'open' ? '#fff' : 'var(--text-tertiary)',
                    cursor: slot.status === 'open' ? 'pointer' : 'not-allowed',
                    textDecoration: slot.status !== 'open' ? 'line-through' : 'none',
                  }}
                >
                  {slot.status === 'open' ? '予約する' : '満席'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
