import { describe, it, expect } from 'vitest'
import { computeScore, isPassed } from '@/lib/utils/score'

describe('computeScore', () => {
  it('正解率100%のとき100を返す', () => {
    expect(computeScore(5, 5)).toBe(100)
  })

  it('正解率0%のとき0を返す', () => {
    expect(computeScore(0, 5)).toBe(0)
  })

  it('正解率60%のとき60を返す', () => {
    expect(computeScore(3, 5)).toBe(60)
  })

  it('総問数0のとき0を返す', () => {
    expect(computeScore(0, 0)).toBe(0)
  })

  it('整数に丸める（3/7 = 43%）', () => {
    expect(computeScore(3, 7)).toBe(43)
  })
})

describe('isPassed', () => {
  it('スコアが合格ライン以上のとき合格', () => {
    expect(isPassed(70, 70)).toBe(true)
    expect(isPassed(100, 70)).toBe(true)
  })

  it('スコアが合格ライン未満のとき不合格', () => {
    expect(isPassed(69, 70)).toBe(false)
    expect(isPassed(0, 70)).toBe(false)
  })
})
