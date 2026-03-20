export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B2447]">
      {/* 背景パターン */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#163A6E] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#C05621] opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* ロゴエリア */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">早稲田AI研究会</h1>
          <p className="text-blue-200/60 text-sm">研修プラットフォーム</p>
        </div>

        {children}
      </div>
    </div>
  )
}
