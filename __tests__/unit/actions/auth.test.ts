import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted() で hoisting 問題を回避
const { mockSignInWithPassword, mockCreateUser, mockSignOut, mockRedirect } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockCreateUser: vi.fn(),
  mockSignOut: vi.fn(),
  mockRedirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    auth: {
      admin: {
        createUser: mockCreateUser,
      },
    },
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

import { signIn, signUp, signOut } from '@/lib/actions/auth'

// ─────────────────────────────────────────────
// signIn
// ─────────────────────────────────────────────
describe('signIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('空のメールアドレスでバリデーションエラーを返す', async () => {
    const result = await signIn({ email: '', password: 'password123' })
    expect(result?.error).toBe('メールアドレスを入力してください')
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('無効なメール形式でバリデーションエラーを返す', async () => {
    const result = await signIn({ email: 'not-an-email', password: 'password123' })
    expect(result?.error).toBe('有効なメールアドレスを入力してください')
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('空のパスワードでバリデーションエラーを返す', async () => {
    const result = await signIn({ email: 'test@example.com', password: '' })
    expect(result?.error).toBe('パスワードを入力してください')
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('Supabase 認証失敗時にエラーメッセージを返す', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    const result = await signIn({ email: 'test@example.com', password: 'wrongpass' })
    expect(result?.error).toBe('メールアドレスまたはパスワードが正しくありません')
  })

  it('認証成功時に / へリダイレクトする', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    await signIn({ email: 'test@example.com', password: 'correctpass' })
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('メール前後のスペースをトリムして認証する', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    await signIn({ email: '  test@example.com  ', password: 'password' })
    expect(mockSignInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    )
  })
})

// ─────────────────────────────────────────────
// signUp
// ─────────────────────────────────────────────
describe('signUp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('パスワード8文字未満でバリデーションエラーを返す', async () => {
    const result = await signUp({ email: 'test@example.com', password: 'short', fullName: '山田' })
    expect(result?.error).toBe('パスワードは8文字以上で入力してください')
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('ニックネームが空のときバリデーションエラーを返す', async () => {
    const result = await signUp({ email: 'test@example.com', password: 'password123', fullName: '' })
    expect(result?.error).toBe('ニックネームを入力してください')
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('admin API エラー時にエラーメッセージを返す', async () => {
    mockCreateUser.mockResolvedValue({ error: { message: 'Something went wrong' } })
    const result = await signUp({ email: 'new@example.com', password: 'password123', fullName: '山田' })
    expect(result?.error).toContain('登録に失敗しました')
  })

  it('すでに登録済みのメールアドレスで専用エラーを返す', async () => {
    mockCreateUser.mockResolvedValue({ error: { message: 'User already registered' } })
    const result = await signUp({ email: 'exists@example.com', password: 'password123', fullName: '山田' })
    expect(result?.error).toBe('このメールアドレスはすでに登録されています')
  })

  it('登録成功後にサインインして / へリダイレクトする', async () => {
    mockCreateUser.mockResolvedValue({ error: null })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    await signUp({ email: 'new@example.com', password: 'password123', fullName: '山田' })
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
    })
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('サインイン失敗時は /login へリダイレクトする', async () => {
    mockCreateUser.mockResolvedValue({ error: null })
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'sign in failed' } })
    await signUp({ email: 'new@example.com', password: 'password123', fullName: '山田' })
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

// ─────────────────────────────────────────────
// signOut
// ─────────────────────────────────────────────
describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({})
  })

  it('サインアウト後に /login へリダイレクトする', async () => {
    await signOut()
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
