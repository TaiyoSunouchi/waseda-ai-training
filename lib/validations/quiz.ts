import { z } from 'zod'

export const quizOptionSchema = z.object({
  text: z.string().min(1, '選択肢を入力してください').max(500),
  is_correct: z.boolean(),
  order_index: z.number().int().min(1).max(4),
})

export const quizSchema = z.object({
  question: z
    .string()
    .min(1, '問題文を入力してください')
    .max(1000, '問題文は1000文字以内で入力してください'),
  explanation: z
    .string()
    .max(2000, '解説は2000文字以内で入力してください')
    .optional(),
  options: z
    .array(quizOptionSchema)
    .length(4, '選択肢は必ず4つ入力してください')
    .refine(
      (opts) => opts.filter((o) => o.is_correct).length === 1,
      '正解は1つだけ選択してください'
    ),
})

export type QuizInput = z.infer<typeof quizSchema>
export type QuizOptionInput = z.infer<typeof quizOptionSchema>
