import Link from 'next/link'
import { RegisterForm } from './register-form'

export default function RegisterPage() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 p-8 border border-white/50">
      <h2 className="text-xl font-bold text-[#0B2447] mb-1">新規登録</h2>
      <p className="text-sm text-gray-500 mb-6">アカウントを作成して研修を始めましょう</p>
      <RegisterForm />
      <p className="mt-5 text-sm text-center text-gray-500">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-[#C05621] hover:text-[#9a3b0b] font-medium transition-colors">
          ログイン
        </Link>
      </p>
    </div>
  )
}
