import { render, screen, fireEvent } from '@testing-library/react'
import ReservationModal from '@/components/ReservationModal'
import type { Clinic, Slot } from '@/types'

const mockClinic: Clinic = {
  id: 1,
  name: 'テストクリニック',
  address: '渋谷区1-1-1',
  phone_display: '03-1234-5678',
  rating: 4,
  open_time: '09:00',
  close_time: '18:00',
  area: { id: 1, name: '渋谷', en_name: 'Shibuya' },
  departments: [{ id: 1, name: '内科' }],
}

const mockSlot: Slot = {
  id: 10,
  slot_date: '2026-06-28',
  slot_time: '10:00',
  status: 'open',
}

describe('ReservationModal', () => {
  it('isOpen=false のとき何もレンダリングしない', () => {
    const { container } = render(
      <ReservationModal
        isOpen={false}
        clinic={mockClinic}
        slot={mockSlot}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('isOpen=true のときモーダルを表示する', () => {
    render(
      <ReservationModal
        isOpen={true}
        clinic={mockClinic}
        slot={mockSlot}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('予約する')).toBeInTheDocument()
  })

  it('閉じるボタンで onClose が呼ばれる', () => {
    const onClose = jest.fn()
    render(
      <ReservationModal
        isOpen={true}
        clinic={mockClinic}
        slot={mockSlot}
        onClose={onClose}
        onConfirm={jest.fn()}
      />
    )
    fireEvent.click(screen.getByLabelText('閉じる'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('年齢層を選択できる', () => {
    render(
      <ReservationModal
        isOpen={true}
        clinic={mockClinic}
        slot={mockSlot}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    const radio = screen.getByLabelText('30〜50代') as HTMLInputElement
    fireEvent.click(radio)
    expect(radio.checked).toBe(true)
  })
})
