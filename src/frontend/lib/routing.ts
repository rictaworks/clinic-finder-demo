import { useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 詳細ページの URL（例: /clinic/12, /reservations/345）から ID を読む。
 * 静的書き出しでは /clinic/_ 1 枚しか無いため、実際の ID はブラウザの現在の URL から取る。
 * 正の整数でなければ null（shell の "_" や不正な値）。
 */
export function readDetailId(pathname: string, prefix: string): number | null {
  if (!pathname.startsWith(prefix)) {
    return null
  }
  const rest = pathname.slice(prefix.length).replace(/\/$/, '')
  if (!/^\d+$/.test(rest)) {
    return null
  }
  const id = Number(rest)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function useDetailId(prefix: string): number | null {
  return readDetailId(usePathname(), prefix)
}

const subscribeNothing = () => () => {}

/**
 * 静的シェルの描画（サーバー側）と、ブラウザの初回描画を一致させるための判定。
 * 水和（hydration）が終わるまで false。URL 由来の値で初回の見た目を変えないために使う。
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )
}
