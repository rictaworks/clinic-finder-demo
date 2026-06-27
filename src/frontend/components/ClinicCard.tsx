'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import type { SearchResult } from '@/types'

interface ClinicCardProps {
  result: SearchResult
}

export default function ClinicCard({ result }: ClinicCardProps) {
  const { clinic, score, available_slots_count } = result
  const ratingStars = '★'.repeat(Math.round(clinic.rating)) + '☆'.repeat(5 - Math.round(clinic.rating))

  return (
    <Link href={`/clinic/${clinic.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,62,80,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        {/* ヘッダー行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {clinic.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FontAwesomeIcon icon={faLocationDot} />
                {clinic.area.name}
              </span>
              <span style={{ color: '#e6b800', letterSpacing: '1px' }}>{ratingStars}</span>
            </div>
          </div>
          <div style={{
            flexShrink: 0,
            background: 'var(--color-navy-700)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '4px 10px',
            lineHeight: 1.4,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.75 }}>スコア</div>
            <div>{score}</div>
          </div>
        </div>

        {/* 診療科 */}
        <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          {clinic.departments.map((d) => d.name).join(' · ')}
        </div>

        {/* フッター */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--color-navy-600)', fontWeight: 500 }}>
            空き <strong>{available_slots_count}</strong> 枠
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>
            {clinic.open_time} 〜 {clinic.close_time}
          </span>
        </div>
      </div>
    </Link>
  )
}
