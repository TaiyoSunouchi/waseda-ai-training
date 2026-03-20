'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { quizSchema } from '@/lib/validations/quiz'
import type { QuizInput } from '@/lib/validations/quiz'

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

export async function createQuiz(stageId: string, input: QuizInput) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const result = quizSchema.safeParse(input)
  if (!result.success) return { error: result.error.issues[0].message }

  const { question, explanation, options } = result.data

  // 最大order_indexを取得
  const { data: existing } = await supabase
    .from('quizzes')
    .select('order_index')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const order_index = (existing?.order_index ?? 0) + 1

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ stage_id: stageId, question, explanation, order_index })
    .select()
    .single()

  if (quizError) return { error: 'クイズの作成に失敗しました' }

  const { error: optionsError } = await supabase.from('quiz_options').insert(
    options.map((opt) => ({
      quiz_id: quiz.id,
      text: opt.text,
      is_correct: opt.is_correct,
      order_index: opt.order_index,
    }))
  )

  if (optionsError) {
    await supabase.from('quizzes').delete().eq('id', quiz.id)
    return { error: '選択肢の作成に失敗しました' }
  }

  revalidatePath(`/admin/courses`)
  return { data: quiz }
}

export async function updateQuiz(quizId: string, stageId: string, input: QuizInput) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const result = quizSchema.safeParse(input)
  if (!result.success) return { error: result.error.issues[0].message }

  const { question, explanation, options } = result.data

  const { error: quizError } = await supabase
    .from('quizzes')
    .update({ question, explanation })
    .eq('id', quizId)

  if (quizError) return { error: 'クイズの更新に失敗しました' }

  // 選択肢を一旦削除して再作成
  await supabase.from('quiz_options').delete().eq('quiz_id', quizId)
  const { error: optionsError } = await supabase.from('quiz_options').insert(
    options.map((opt) => ({
      quiz_id: quizId,
      text: opt.text,
      is_correct: opt.is_correct,
      order_index: opt.order_index,
    }))
  )

  if (optionsError) return { error: '選択肢の更新に失敗しました' }

  revalidatePath(`/admin/courses`)
  return { data: true }
}

export async function deleteQuiz(quizId: string) {
  const { supabase, error: authError } = await requireAdmin()
  if (authError) return { error: authError }

  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
  if (error) return { error: 'クイズの削除に失敗しました' }

  revalidatePath(`/admin/courses`)
  return { data: true }
}
