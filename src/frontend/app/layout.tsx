import type { Metadata } from 'next'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import './globals.css'

config.autoAddCss = false

export const metadata: Metadata = {
  title: 'Clinic Finder Demo',
  description: '症状・場所・予約空き枠からクリニックを探すデモアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--color-navy-700)',
          height: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            maxWidth: '880px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <a href="/" style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
            }}>
              <span style={{ color: 'var(--color-navy-300)', fontSize: '18px' }}>✦</span>
              クリニックファインダー
            </a>
          </div>
        </nav>
        <main style={{
          paddingTop: '60px',
          minHeight: '100vh',
          maxWidth: '880px',
          margin: '0 auto',
          padding: '60px 24px 64px',
        }}>
          {children}
        </main>
      </body>
    </html>
  )
}
