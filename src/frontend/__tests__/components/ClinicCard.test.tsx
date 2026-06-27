import { render, screen } from '@testing-library/react'
import ClinicCard from '@/components/ClinicCard'
import type { SearchResult } from '@/types'

const mockResult: SearchResult = {
  score: 75,
  available_slots_count: 3,
  clinic: {
    id: 1,
    name: 'テストクリニック',
    address: '渋谷区1-1-1',
    phone_display: '03-1234-5678',
    rating: 4,
    open_time: '09:00',
    close_time: '18:00',
    area: { id: 1, name: '渋谷', en_name: 'Shibuya' },
    departments: [
      { id: 1, name: '内科' },
      { id: 2, name: '小児科' },
    ],
  },
}

describe('ClinicCard', () => {
  it('クリニック名を表示する', () => {
    render(<ClinicCard result={mockResult} />)
    expect(screen.getByText('テストクリニック')).toBeInTheDocument()
  })

  it('エリア名を表示する', () => {
    render(<ClinicCard result={mockResult} />)
    expect(screen.getByText(/渋谷/)).toBeInTheDocument()
  })

  it('診療科タグを表示する', () => {
    render(<ClinicCard result={mockResult} />)
    expect(screen.getByText('内科')).toBeInTheDocument()
    expect(screen.getByText('小児科')).toBeInTheDocument()
  })

  it('空き枠数を表示する', () => {
    render(<ClinicCard result={mockResult} />)
    expect(screen.getByText(/3件/)).toBeInTheDocument()
  })

  it('詳細を見るリンクが存在する', () => {
    render(<ClinicCard result={mockResult} />)
    const link = screen.getByRole('link', { name: '詳細を見る' })
    expect(link).toHaveAttribute('href', '/clinic/1')
  })
})
