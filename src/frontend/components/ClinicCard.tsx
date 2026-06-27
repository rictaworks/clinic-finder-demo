'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import StarRating from '@/components/StarRating'
import type { SearchResult } from '@/types'

interface ClinicCardProps {
  result: SearchResult
}

export default function ClinicCard({ result }: ClinicCardProps) {
  const { clinic, available_slots_count } = result

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{clinic.name}</h3>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <FontAwesomeIcon icon={faLocationDot} className="text-blue-500 flex-shrink-0" />
            <span>{clinic.area.name} &mdash; {clinic.address}</span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <StarRating rating={clinic.rating} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {clinic.departments.map((dept) => (
          <span
            key={dept.id}
            className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
          >
            {dept.name}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm text-green-700">
          <FontAwesomeIcon icon={faCalendarCheck} />
          <span>空き枠: {available_slots_count}件</span>
        </span>
        <Link
          href={`/clinic/${clinic.id}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  )
}
