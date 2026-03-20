import Link from 'next/link'
import { StageForm } from '@/components/admin/StageForm'
import { ArrowLeft } from 'lucide-react'

export default async function NewStagePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          ステージ一覧に戻る
        </Link>
        <h1 className="text-xl font-bold text-[#0B2447]">新しいステージを追加</h1>
      </div>
      <div className="max-w-xl">
        <StageForm courseId={courseId} />
      </div>
    </div>
  )
}
