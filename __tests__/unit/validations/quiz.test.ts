import { describe, it, expect } from 'vitest'
import { quizSchema } from '@/lib/validations/quiz'

const validOptions = [
  { text: '選択肢A', is_correct: true, order_index: 1 },
  { text: '選択肢B', is_correct: false, order_index: 2 },
  { text: '選択肢C', is_correct: false, order_index: 3 },
  { text: '選択肢D', is_correct: false, order_index: 4 },
]

describe('quizSchema', () => {
  it('正常な入力を受け入れる', () => {
    const result = quizSchema.safeParse({
      question: 'テスト問題',
      options: validOptions,
    })
    expect(result.success).toBe(true)
  })

  it('問題文が空の場合を拒否する', () => {
    const result = quizSchema.safeParse({ question: '', options: validOptions })
    expect(result.success).toBe(false)
  })

  it('選択肢が4つでない場合を拒否する', () => {
    const result = quizSchema.safeParse({
      question: 'テスト問題',
      options: validOptions.slice(0, 3),
    })
    expect(result.success).toBe(false)
  })

  it('正解が0個の場合を拒否する', () => {
    const result = quizSchema.safeParse({
      question: 'テスト問題',
      options: validOptions.map((o) => ({ ...o, is_correct: false })),
    })
    expect(result.success).toBe(false)
  })

  it('正解が2個以上の場合を拒否する', () => {
    const result = quizSchema.safeParse({
      question: 'テスト問題',
      options: validOptions.map((o, i) => ({ ...o, is_correct: i < 2 })),
    })
    expect(result.success).toBe(false)
  })
})
