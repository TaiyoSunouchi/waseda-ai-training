import { createClient } from '@/lib/supabase/server'
import type { QuizWithOptions } from '@/lib/supabase/types'

export async function getQuizzes(stageId: string): Promise<{ data: QuizWithOptions[] | null; error: string | undefined }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_options (*)
    `)
    .eq('stage_id', stageId)
    .order('order_index', { ascending: true })
  return { data: data as unknown as QuizWithOptions[] | null, error: error?.message }
}

export async function getQuizzesForTrainee(stageId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id, stage_id, question, order_index,
      quiz_options (id, text, order_index)
    `)
    .eq('stage_id', stageId)
    .order('order_index', { ascending: true })
  return { data: data as unknown as Array<{
    id: string
    stage_id: string
    question: string
    order_index: number
    quiz_options: Array<{ id: string; text: string; order_index: number }>
  }> | null, error: error?.message }
}
