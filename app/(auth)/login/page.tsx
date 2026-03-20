import Link from 'next/link'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 p-8 border border-white/50">
      <h2 className="text-xl font-bold text-[#0B2447] mb-1">ログイン</h2>
      <p className="text-sm text-gray-500 mb-6">アカウントにサインインしてください</p>
      <LoginForm />
      <p className="mt-5 text-sm text-center text-gray-500">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="text-[#C05621] hover:text-[#9a3b0b] font-medium transition-colors">
          新規登録
        </Link>
      </p>
    </div>
  )
}
