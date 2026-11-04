import { DETAIL_SHELL_ID } from '@/lib/constants'

// 静的書き出し用。詳細ページは shell（/clinic/_）1 枚だけを生成し、
// 実際の ID は Worker が shell を返したあとブラウザ側で URL から読む（lib/routing.ts）。
export function generateStaticParams() {
  return [{ id: DETAIL_SHELL_ID }]
}

export default function ClinicDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
