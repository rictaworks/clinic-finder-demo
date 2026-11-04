import { readDetailId } from '@/lib/routing'

describe('readDetailId（詳細ページの ID を URL から読む）', () => {
  it('プレフィックスの後ろの正の整数を返す', () => {
    expect(readDetailId('/clinic/12', '/clinic/')).toBe(12)
    expect(readDetailId('/reservations/345', '/reservations/')).toBe(345)
  })

  it('末尾のスラッシュは無視する', () => {
    expect(readDetailId('/clinic/7/', '/clinic/')).toBe(7)
  })

  it('静的シェルの "_" や数字以外は null', () => {
    expect(readDetailId('/clinic/_', '/clinic/')).toBeNull()
    expect(readDetailId('/clinic/abc', '/clinic/')).toBeNull()
    expect(readDetailId('/clinic/0', '/clinic/')).toBeNull()
  })

  it('プレフィックスが違うパスは null', () => {
    expect(readDetailId('/search', '/clinic/')).toBeNull()
    expect(readDetailId('/reservations/5', '/clinic/')).toBeNull()
  })
})
