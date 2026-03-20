'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadContentImage(
  formData: FormData
): Promise<{ data?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未認証です' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: '管理者権限が必要です' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'ファイルが見つかりません' }
  if (!file.type.startsWith('image/')) return { error: '画像ファイルを選択してください' }
  if (file.size > 10 * 1024 * 1024) return { error: '画像は10MB以内にしてください' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('content-images')
    .upload(fileName, file, { contentType: file.type })

  if (uploadError) return { error: '画像のアップロードに失敗しました' }

  const { data } = supabase.storage.from('content-images').getPublicUrl(fileName)
  return { data: data.publicUrl }
}
