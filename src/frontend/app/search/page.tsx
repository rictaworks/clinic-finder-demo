'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { api } from '@/lib/api'
import ClinicCard from '@/components/ClinicCard'
import ErrorMessage from '@/components/ErrorMessage'
import { ERROR_MESSAGES } from '@/lib/constants'
import type { SearchResult } from '@/types'

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
      <div className="flex justify-center py-16">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <strong>検索条件:</strong> 症状「{symptom}」、地域「{area}」{hasSlot && '、空き枠あり'}
        &nbsp;&mdash;&nbsp;<strong>{results.length}件</strong>見つかりました
      </div>

      {results.length === 0 ? (
        <p className="text-center text-gray-500 py-12">条件に一致するクリニックが見つかりませんでした。</p>
      ) : (
        <div className="space-y-4">
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
    <div>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
          検索に戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">検索結果</h1>
      <Suspense fallback={
        <div className="flex justify-center py-16">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
}
