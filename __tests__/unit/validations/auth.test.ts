import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('正常な入力を受け入れる', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('無効なメールアドレスを拒否する', () => {
    const result = loginSchema.safeParse({ email: 'invalid-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('8文字未満のパスワードを拒否する', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'short' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('正常な入力を受け入れる', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      fullName: '山田太郎',
    })
    expect(result.success).toBe(true)
  })

  it('氏名が空の場合を拒否する', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      fullName: '',
    })
    expect(result.success).toBe(false)
  })
})
