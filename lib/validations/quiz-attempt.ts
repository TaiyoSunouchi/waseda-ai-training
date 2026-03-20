import { z } from 'zod'

export const quizAnswerSchema = z.object({
  quiz_id: z.string().uuid('有効なクイズIDを指定してください'),
  selected_option_id: z.string().uuid('有効な選択肢IDを指定してください'),
})

export const quizAttemptSchema = z.object({
  stage_id: z.string().uuid('有効なステージIDを指定してください'),
  answers: z
    .array(quizAnswerSchema)
    .min(1, '回答を入力してください'),
})

export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>
