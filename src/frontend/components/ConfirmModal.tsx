'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '360px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 id="confirm-modal-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} aria-label="閉じる" style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', padding: '12px 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: '#fff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              background: '#c84030',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
