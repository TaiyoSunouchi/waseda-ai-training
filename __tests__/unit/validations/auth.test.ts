import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

// ─────────────────────────────────────────────
// loginSchema
// ─────────────────────────────────────────────
describe('loginSchema', () => {
  it('正常なメール+パスワードを受け入れる', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('メールの前後スペースを自動トリムして受け入れる', () => {
    const result = loginSchema.safeParse({ email: '  test@example.com  ', password: 'pass' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })

  it('メールが空のとき "メールアドレスを入力してください" エラー', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('メールアドレスを入力してください')
    }
  })

  it('無効なメール形式のとき "有効なメールアドレスを入力してください" エラー', () => {
    const result = loginSchema.safeParse({ email: 'invalid-email', password: 'password' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('有効なメールアドレスを入力してください')
    }
  })

  it('パスワードが空のとき拒否する', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードを入力してください')
    }
  })

  it('ログインは1文字のパスワードでも許可する（強度チェックはサーバー側）', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'a' })
    expect(result.success).toBe(true)
  })

  it('メールアドレスが未入力のとき拒否する', () => {
    const result = loginSchema.safeParse({ email: '   ', password: 'password' })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// registerSchema
// ─────────────────────────────────────────────
describe('registerSchema', () => {
  const validInput = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    fullName: '山田太郎',
  }

  it('正常な全フィールドを受け入れる', () => {
    const result = registerSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('メールの前後スペースを自動トリムして受け入れる', () => {
    const result = registerSchema.safeParse({ ...validInput, email: '  test@example.com  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })

  it('メールが空のとき拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, email: '' })
    expect(result.success).toBe(false)
  })

  it('無効なメール形式のとき拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('パスワード8文字未満を拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'short', confirmPassword: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('パスワードは8文字以上で入力してください')
    }
  })

  it('confirmPassword が不一致のとき拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === 'パスワードが一致しません')).toBe(true)
    }
  })

  it('ニックネームが空のとき拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, fullName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('ニックネームを入力してください')
    }
  })

  it('ニックネームが101文字以上のとき拒否する', () => {
    const result = registerSchema.safeParse({ ...validInput, fullName: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})
