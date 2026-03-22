import { z } from 'zod'

// ログイン用：パスワード強度チェック不要（サーバーが判断する）
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

// 登録用：パスワード強度チェックあり
export const registerSchema = z.object({
  email: z.string().trim().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
  fullName: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .max(100, 'ニックネームは100文字以内で入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
