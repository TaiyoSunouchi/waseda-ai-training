'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { stageSchema } from '@/lib/validations/course'

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

export async function createStage(courseId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    pass_threshold: Number(formData.get('pass_threshold') ?? 70),
  }
  const result = stageSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  // 最大order_indexを取得して+1
  const { data: existing } = await supabase
    .from('stages')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const order_index = (existing?.order_index ?? 0) + 1

  const { data, error } = await supabase
    .from('stages')
    .insert({ ...result.data, course_id: courseId, order_index })
    .select()
    .single()

  if (error) return { error: 'ステージの作成に失敗しました' }
  revalidatePath(`/admin/courses/${courseId}`)
  return { data }
}

export async function updateStage(stageId: string, courseId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    pass_threshold: Number(formData.get('pass_threshold') ?? 70),
  }
  const result = stageSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from('stages')
    .update(result.data)
    .eq('id', stageId)

  if (error) return { error: 'ステージの更新に失敗しました' }
  revalidatePath(`/admin/courses/${courseId}`)
  return { data: true }
}

export async function deleteStage(stageId: string, courseId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { error } = await supabase.from('stages').delete().eq('id', stageId)
  if (error) return { error: 'ステージの削除に失敗しました' }

  revalidatePath(`/admin/courses/${courseId}`)
  return { data: true }
}

export async function saveStageContent(stageId: string, content: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { error } = await supabase
    .from('stages')
    .update({ content })
    .eq('id', stageId)

  if (error) return { error: 'コンテンツの保存に失敗しました' }
  revalidatePath('/admin')
  return { data: true }
}

export async function reorderStages(courseId: string, orderedIds: string[]) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  // UNIQUE (course_id, order_index) 制約があるため、一括更新すると衝突する。
  // フェーズ1: 現在の値と重複しない大きいオフセット(+1000)を付けた値で全件更新
  const tempResults = await Promise.all(
    orderedIds.map((id, idx) =>
      supabase
        .from('stages')
        .update({ order_index: idx + 1001 })
        .eq('id', id)
        .eq('course_id', courseId)
    )
  )
  if (tempResults.find((r) => r.error)) return { error: 'ステージの並び替えに失敗しました' }

  // フェーズ2: 最終的な値(1, 2, 3...)で全件更新
  const finalResults = await Promise.all(
    orderedIds.map((id, idx) =>
      supabase
        .from('stages')
        .update({ order_index: idx + 1 })
        .eq('id', id)
        .eq('course_id', courseId)
    )
  )
  if (finalResults.find((r) => r.error)) return { error: 'ステージの並び替えに失敗しました' }

  revalidatePath(`/admin/courses/${courseId}`)
  return { data: true }
}
