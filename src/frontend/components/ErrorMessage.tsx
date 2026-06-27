'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
      <FontAwesomeIcon icon={faCircleExclamation} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
