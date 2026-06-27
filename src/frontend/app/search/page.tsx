'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import ClinicCard from '@/components/ClinicCard'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES } from '@/lib/constants'
import type { SearchResult } from '@/types'

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

function SearchResults() {
  const searchParams = useSearchParams()
  const symptom = searchParams.get('symptom') || ''
  const area = searchParams.get('area') || ''
  const hasSlot = searchParams.get('has_slot') === 'true'

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symptom && !area) {
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .search({ symptom, area, has_slot: hasSlot })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed: ${res.status}`)
        return res.json()
      })
      .then((data: SearchResult[]) => {
        setResults(data)
      })
      .catch(() => {
        setError(ERROR_MESSAGES.NETWORK)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [symptom, area, hasSlot])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-navy-500)', fontSize: '28px' }} />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  const summary = [symptom && `「${symptom}」`, area && area].filter(Boolean).join(' / ')

  return (
    <>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        {results.length}件見つかりました
        {summary && <span style={{ color: 'var(--text-tertiary)' }}> — {summary}</span>}
      </p>

      {results.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
        }}>
          <p>条件に合うクリニックが見つかりませんでした。</p>
          <p style={{ marginTop: '8px', fontSize: '12.5px' }}>エリアや症状の条件を変えてお試しください。</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((result) => (
            <ClinicCard key={result.clinic.id} result={result} />
          ))}
        </div>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <div style={{ paddingTop: '16px' }}>
      <div style={{
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Link href="/" style={backLinkStyle}>
          <FontAwesomeIcon icon={faChevronLeft} />
          検索に戻る
        </Link>
      </div>

      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-navy-500)', fontSize: '28px' }} />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
}
