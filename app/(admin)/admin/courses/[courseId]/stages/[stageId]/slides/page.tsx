import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStage } from '@/lib/queries/stages'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ArrowLeft, Save } from 'lucide-react'

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ courseId: string; stageId: string }>
}) {
  const { courseId, stageId } = await params
  const { data: stage } = await getStage(stageId)
  if (!stage) return notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          ステージ一覧に戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0B2447]">{stage.title} — コンテンツ編集</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Save className="w-3.5 h-3.5" />
            入力すると自動保存されます
          </div>
        </div>
      </div>

      <RichTextEditor stageId={stageId} initialContent={stage.content} />
    </div>
  )
}
