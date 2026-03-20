'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { error: 'メールアドレスの確認が完了していません。Supabaseダッシュボードで確認を完了するか、管理者にお問い合わせください' }
    }
    return { error: `ログインに失敗しました: ${error.message}` }
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  }

  const result = registerSchema.safeParse(raw)
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
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: 'このメールアドレスは既に登録されています' }
    }
    return { error: `登録に失敗しました: ${error.message}` }
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
