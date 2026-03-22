'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginSchema } from '@/lib/validations/auth'

const serverRegisterSchema = z.object({
  email: z.string().trim().min(1).email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  fullName: z.string().min(1, 'ニックネームを入力してください').max(100),
})

// 研修生・一般ユーザー：メール+パスワードで新規登録
export async function signUp(raw: { email: string; password: string; fullName: string }) {
  const result = serverRegisterSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // admin API でユーザー作成（メール確認スキップ・RLS をバイパス）
  const adminClient = createAdminClient()
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: result.data.email,
    password: result.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: result.data.fullName,
      role: 'trainee',
    },
  })

  if (createError) {
    console.error('[signUp] createUser error:', createError.message)
    if (createError.message.toLowerCase().includes('already registered') || createError.message.toLowerCase().includes('already exists')) {
      return { error: 'このメールアドレスはすでに登録されています' }
    }
    return { error: `登録に失敗しました: ${createError.message}` }
  }

  // Cookie ベースでサインイン
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (signInError) {
    console.error('[signUp] signIn error:', signInError.message)
    redirect('/login')
  }

  redirect('/')
}

// ログイン（研修生・管理者共通）
export async function signIn(raw: { email: string; password: string }) {
  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email.trim(),
    password: result.data.password,
  })

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
