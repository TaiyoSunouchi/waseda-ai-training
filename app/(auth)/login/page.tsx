import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div>
      {/* ベアと吹き出し */}
      <div className="flex items-end justify-center gap-3 mb-5">
        <Image
          src="/mascot/smile.jpg"
          alt="マスコットベア"
          width={76}
          height={76}
          className="object-contain drop-shadow-lg flex-shrink-0"
        />
        <div className="relative bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-md text-sm text-gray-700 font-medium">
          おかえり！一緒に頑張ろう🎓
          {/* 吹き出し尻尾 */}
          <div className="absolute -bottom-[8px] left-4 w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white/60" />
          <div className="absolute -bottom-[6px] left-4 w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white/90" />
        </div>
      </div>

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
    </div>
  )
}
