'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { courseSchema } from '@/lib/validations/course'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, userId: null, error: '未認証です' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { supabase, userId: user.id, error: '管理者権限が必要です' }
  }
  return { supabase, userId: user.id, error: null }
}

export async function createCourse(formData: FormData) {
  const { supabase, userId, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
  }
  const result = courseSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  // 最大 order_index を取得して +1
  const { data: existing } = await supabase
    .from('courses')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const order_index = (existing?.order_index ?? 0) + 1

  const { data, error } = await supabase
    .from('courses')
    .insert({ ...result.data, created_by: userId!, order_index })
    .select()
    .single()

  if (error) return { error: 'コースの作成に失敗しました' }
  revalidatePath('/admin/dashboard')
  return { data }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
  }
  const result = courseSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from('courses')
    .update(result.data)
    .eq('id', courseId)

  if (error) return { error: 'コースの更新に失敗しました' }
  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/courses/${courseId}`)
  return { data: true }
}

export async function deleteCourse(courseId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) return { error: 'コースの削除に失敗しました' }

  revalidatePath('/admin/dashboard')
  return { data: true }
}

export async function reorderCourses(orderedIds: string[]) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const updates = orderedIds.map((id, idx) =>
    supabase
      .from('courses')
      .update({ order_index: idx + 1 })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: 'コースの並び替えに失敗しました' }

  revalidatePath('/admin/dashboard')
  return { data: true }
}

export async function toggleCoursePublished(courseId: string, isPublished: boolean) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId)

  if (error) return { error: '公開状態の変更に失敗しました' }
  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/courses/${courseId}`)
  return { data: true }
}
