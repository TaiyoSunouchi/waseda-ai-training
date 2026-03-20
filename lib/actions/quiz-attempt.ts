'use server'

import { createClient } from '@/lib/supabase/server'
import { quizAttemptSchema } from '@/lib/validations/quiz-attempt'
import { computeScore, isPassed } from '@/lib/utils/score'
import { isStageAccessible } from '@/lib/utils/access'
import type { QuizAttemptInput } from '@/lib/validations/quiz-attempt'
import type { UserProgress } from '@/lib/supabase/types'

export type SingleAnswerResult = {
  isCorrect: boolean
  correctOptionId: string
  explanation: string | null
}

export async function checkSingleAnswer(
  quizId: string,
  selectedOptionId: string
): Promise<{ data?: SingleAnswerResult; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未認証です' }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('explanation, quiz_options(id, is_correct)')
    .eq('id', quizId)
    .single()

  if (!quiz) return { error: 'クイズが見つかりません' }

  type Q = { explanation: string | null; quiz_options: { id: string; is_correct: boolean }[] }
  const q = quiz as unknown as Q
  const correctOption = q.quiz_options.find((o) => o.is_correct)
  if (!correctOption) return { error: '正解データが見つかりません' }

  return {
    data: {
      isCorrect: selectedOptionId === correctOption.id,
      correctOptionId: correctOption.id,
      explanation: q.explanation,
    },
  }
}

export type QuizAttemptResult = {
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  perQuestionResults: {
    quizId: string
    question: string
    explanation: string | null
    selectedOptionId: string
    correctOptionId: string
    isCorrect: boolean
  }[]
  nextStageId: string | null
}

export async function submitQuizAttempt(
  input: QuizAttemptInput
): Promise<{ data?: QuizAttemptResult; error?: string }> {
  // 1. バリデーション
  const result = quizAttemptSchema.safeParse(input)
  if (!result.success) return { error: result.error.issues[0].message }

  const { stage_id, answers } = result.data

  // 2. 認証確認
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未認証です' }

  // 3. ステージ情報を取得
  const { data: stage } = await supabase
    .from('stages')
    .select('*, courses(*)')
    .eq('id', stage_id)
    .single()

  if (!stage) return { error: 'ステージが見つかりません' }

  // 4. コース公開確認
  const course = (stage as { courses: { is_published: boolean } }).courses
  if (!course?.is_published) return { error: 'このコースは公開されていません' }

  // 5. ステージアクセス権確認
  const { data: allStages } = await supabase
    .from('stages')
    .select('*')
    .eq('course_id', stage.course_id)
    .order('order_index', { ascending: true })

  if (!allStages) return { error: 'ステージ情報の取得に失敗しました' }

  const { data: progressData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('stage_id', allStages.map((s) => s.id))

  const progressMap = new Map<string, UserProgress>(
    (progressData ?? []).map((p) => [p.stage_id, p])
  )

  if (!isStageAccessible(stage, allStages, progressMap)) {
    return { error: 'このステージにはまだアクセスできません' }
  }

  // 6. DBから正解選択肢を全取得（サーバーサイドのみ）
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select(`
      id, question, explanation,
      quiz_options (id, is_correct)
    `)
    .eq('stage_id', stage_id)
    .order('order_index', { ascending: true })

  if (!quizzes || quizzes.length === 0) return { error: 'クイズが見つかりません' }

  // 7. サーバーサイドで採点
  type QuizWithOptions = {
    id: string
    question: string
    explanation: string | null
    quiz_options: { id: string; is_correct: boolean }[]
  }

  const correctMap = new Map<string, string>()
  for (const quiz of quizzes as QuizWithOptions[]) {
    const correct = quiz.quiz_options.find((o) => o.is_correct)
    if (correct) correctMap.set(quiz.id, correct.id)
  }

  let correctCount = 0
  const perQuestionResults = (quizzes as QuizWithOptions[]).map((quiz) => {
    const userAnswer = answers.find((a) => a.quiz_id === quiz.id)
    const correctOptionId = correctMap.get(quiz.id) ?? ''
    const selectedOptionId = userAnswer?.selected_option_id ?? ''
    const isCorrect = selectedOptionId === correctOptionId
    if (isCorrect) correctCount++
    return {
      quizId: quiz.id,
      question: quiz.question,
      explanation: quiz.explanation,
      selectedOptionId,
      correctOptionId,
      isCorrect,
    }
  })

  const totalQuestions = quizzes.length
  const score = computeScore(correctCount, totalQuestions)
  const passed = isPassed(score, stage.pass_threshold)

  // 8. quiz_attempts INSERT
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      stage_id,
      score,
      total_questions: totalQuestions,
      correct_answers: correctCount,
    })
    .select()
    .single()

  if (attemptError || !attempt) return { error: '受験記録の保存に失敗しました' }

  // 9. quiz_answers 一括INSERT
  const answerInserts = perQuestionResults.map((r) => ({
    attempt_id: attempt.id,
    quiz_id: r.quizId,
    selected_option_id: r.selectedOptionId,
    is_correct: r.isCorrect,
  }))

  await supabase.from('quiz_answers').insert(answerInserts)

  // 10. update_user_progress RPC（原子的UPSERT）
  await supabase.rpc('update_user_progress', {
    p_user_id: user.id,
    p_stage_id: stage_id,
    p_score: score,
    p_passed: passed,
  })

  // 11. 次ステージIDを取得（合格時のみ）
  let nextStageId: string | null = null
  if (passed) {
    const nextStage = allStages.find(
      (s) => s.course_id === stage.course_id && s.order_index === stage.order_index + 1
    )
    nextStageId = nextStage?.id ?? null
  }

  return {
    data: {
      score,
      correctAnswers: correctCount,
      totalQuestions,
      passed,
      perQuestionResults,
      nextStageId,
    },
  }
}
