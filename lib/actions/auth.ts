'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginSchema } from '@/lib/validations/auth'

const serverRegisterSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  fullName: z.string().min(1, 'ニックネームを入力してください').max(100, 'ニックネームは100文字以内で入力してください'),
})

export async function signIn(raw: { email: string; password: string }) {
  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  redirect('/')
}

export async function signUp(raw: { email: string; password: string; fullName: string }) {
  const result = serverRegisterSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // adminクライアントでメール確認をスキップして登録
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.createUser({
    email: result.data.email,
    password: result.data.password,
    email_confirm: true, // メール確認を自動でスキップ
    user_metadata: {
      full_name: result.data.fullName,
      role: 'trainee',
    },
  })

  if (error) {
    return { error: '登録に失敗しました。入力内容を確認してください' }
  }

  // 登録成功後、そのままログイン
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (signInError) {
    // ログインに失敗してもloginページへ（手動ログインを促す）
    redirect('/login')
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
