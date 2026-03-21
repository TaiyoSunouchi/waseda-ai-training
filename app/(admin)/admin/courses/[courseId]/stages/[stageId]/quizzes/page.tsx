import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStage } from '@/lib/queries/stages'
import { getQuizzes } from '@/lib/queries/quizzes'
import { QuizEditor } from '@/components/admin/QuizEditor'
import { ArrowLeft } from 'lucide-react'

export default async function AdminQuizzesPage({
  params,
}: {
  params: Promise<{ courseId: string; stageId: string }>
}) {
  const { courseId, stageId } = await params
  const { data: stage } = await getStage(stageId)
  if (!stage) return notFound()

  const { data: quizzes } = await getQuizzes(stageId)

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2447] bg-white border border-[#E8EEF7] hover:border-[#C8D6EC] hover:bg-[#F2F5FA] px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 mb-5">
          <ArrowLeft className="w-4 h-4" />
          ステージ一覧に戻る
        </Link>
        <h1 className="text-xl font-bold text-[#0B2447]">{stage.title} — クイズ管理</h1>
      </div>

      <QuizEditor stageId={stageId} quizzes={quizzes ?? []} />
    </div>
  )
}
