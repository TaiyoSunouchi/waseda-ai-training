import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStage } from '@/lib/queries/stages'
import { StageForm } from '@/components/admin/StageForm'

export default async function EditStagePage({
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
        <Link href={`/admin/courses/${courseId}`} className="text-sm text-blue-600 hover:underline">
          ← ステージ一覧に戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">ステージを編集</h1>
      </div>
      <div className="max-w-xl">
        <StageForm courseId={courseId} stage={stage} />
      </div>
    </div>
  )
}
