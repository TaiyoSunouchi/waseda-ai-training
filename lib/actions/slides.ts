'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, error: '未認証です' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { supabase, error: '管理者権限が必要です' }
  }
  return { supabase, error: null }
}

export async function uploadSlide(stageId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const file = formData.get('file') as File | null
  const title = formData.get('title') as string

  if (!file) return { error: 'ファイルを選択してください' }
  if (file.type !== 'application/pdf') return { error: 'PDFファイルのみアップロードできます' }
  if (file.size > MAX_FILE_SIZE) return { error: 'ファイルサイズは50MB以内にしてください' }
  if (!title?.trim()) return { error: 'タイトルを入力してください' }

  // 最大order_indexを取得
  const { data: existing } = await supabase
    .from('slides')
    .select('order_index')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const order_index = (existing?.order_index ?? 0) + 1
  const fileName = `${stageId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  // Supabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from('slides')
    .upload(fileName, file, { contentType: 'application/pdf' })

  if (uploadError) return { error: 'ファイルのアップロードに失敗しました' }

  // DBにレコード追加
  const { data, error: dbError } = await supabase
    .from('slides')
    .insert({ stage_id: stageId, title: title.trim(), file_url: fileName, order_index })
    .select()
    .single()

  if (dbError) {
    // DB登録失敗時はストレージのファイルを削除
    await supabase.storage.from('slides').remove([fileName])
    return { error: 'スライドの登録に失敗しました' }
  }

  revalidatePath(`/admin/courses`)
  return { data }
}

export async function deleteSlide(slideId: string, stageId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { data: slide } = await supabase
    .from('slides')
    .select('file_url')
    .eq('id', slideId)
    .single()

  if (!slide) return { error: 'スライドが見つかりません' }

  // Storageから削除
  await supabase.storage.from('slides').remove([slide.file_url])

  // DBから削除
  const { error } = await supabase.from('slides').delete().eq('id', slideId)
  if (error) return { error: 'スライドの削除に失敗しました' }

  revalidatePath(`/admin/courses`)
  return { data: true }
}

export async function getSlideSignedUrl(slideId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未認証です' }

  const { data: slide } = await supabase
    .from('slides')
    .select('file_url, stage_id')
    .eq('id', slideId)
    .single()

  if (!slide) return { error: 'スライドが見つかりません' }

  const { data } = await supabase.storage
    .from('slides')
    .createSignedUrl(slide.file_url, 3600)

  if (!data?.signedUrl) return { error: '署名付きURLの生成に失敗しました' }
  return { data: data.signedUrl }
}
