import Link from 'next/link'
import { LoginForm } from '../login/login-form'

export default function AdminLoginPage() {
  return (
    <div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 p-8 border border-white/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#0B2447] text-white">管理者</span>
          <h2 className="text-xl font-bold text-[#0B2447]">管理者ログイン</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">管理者アカウントでサインインしてください</p>
        <LoginForm />
        <p className="mt-5 text-sm text-center text-gray-400">
          <Link href="/register" className="hover:text-gray-600 transition-colors underline underline-offset-2">
            研修生として登録はこちら
          </Link>
        </p>
      </div>
    </div>
  )
}
