import type { Metadata } from 'next'
import Script from 'next/script'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHospital, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import './globals.css'

config.autoAddCss = false

export const metadata: Metadata = {
  title: 'クリニックファインダーデモ',
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
        {/* アンバーバナー */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: '#d97706',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 500,
          textAlign: 'center',
          padding: '6px 16px',
          lineHeight: 1.5,
        }}>
          ⚠️ これはデモ版です。データはサーバー再起動時にリセットされる場合があります。
        </div>

        {/* ナビゲーション */}
        <nav style={{
          position: 'fixed',
          top: '30px',
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
              <FontAwesomeIcon icon={faHospital} style={{ color: 'var(--color-navy-300)', fontSize: '16px' }} />
              クリニックファインダー
            </a>

            {/* デモ一覧へ */}
            <a
              href="https://rictaworks.jp/#demos"
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '13px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                paddingLeft: '16px',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              ← デモ一覧へ
            </a>
          </div>
        </nav>

        <main style={{
          paddingTop: '90px',
          minHeight: '100vh',
          maxWidth: '880px',
          margin: '0 auto',
          padding: '90px 24px 48px',
        }}>
          {children}
        </main>

        {/* フッター */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
        }}>
          <a
            href="/legal"
            style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
          >
            利用規約・免責事項・連絡先
          </a>
          <span style={{ margin: '0 8px' }}>|</span>
          <span>© 2026 Ricta Works</span>
        </footer>

        {/* GA4 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-C04W1XKS16" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-C04W1XKS16');
        `}</Script>

        {/* 右下固定ご相談ボタン */}
        <a
          href="https://rictaworks.jp/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 300,
            background: 'var(--color-navy-700)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '9999px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <FontAwesomeIcon icon={faCommentDots} />
          ご相談はこちら
        </a>
      </body>
    </html>
  )
}
