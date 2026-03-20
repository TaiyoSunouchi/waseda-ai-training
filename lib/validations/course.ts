import { z } from 'zod'

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
})

export const stageSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  pass_threshold: z
    .number()
    .int()
    .min(0, '合格ラインは0以上で設定してください')
    .max(100, '合格ラインは100以下で設定してください')
    .default(70),
})

export type CourseInput = z.infer<typeof courseSchema>
export type StageInput = z.infer<typeof stageSchema>
