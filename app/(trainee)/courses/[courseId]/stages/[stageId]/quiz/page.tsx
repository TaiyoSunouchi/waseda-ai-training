import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStage } from '@/lib/queries/stages'
import { getQuizzesForTrainee } from '@/lib/queries/quizzes'
import { QuizForm } from '@/components/quiz/QuizForm'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; stageId: string }>
}) {
  const { courseId, stageId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stage } = await getStage(stageId)
  if (!stage || stage.course_id !== courseId) return notFound()

  const { data: quizzes } = await getQuizzesForTrainee(stageId)

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto">
        <Link href={`/courses/${courseId}/stages/${stageId}/slides`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          コンテンツに戻る
        </Link>
        <div className="card-premium p-12 text-center">
          <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">このステージにはまだクイズが登録されていません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-6">
        <Link href={`/courses/${courseId}/stages/${stageId}/slides`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          コンテンツに戻る
        </Link>
        <h1 className="text-xl font-bold text-[#0B2447]">{stage.title} — クイズ</h1>
        <p className="text-sm text-gray-500 mt-1">
          合格ライン: <span className="font-semibold text-[#0B2447]">{stage.pass_threshold}%</span> ／ 全{quizzes.length}問
        </p>
      </div>

      <QuizForm stageId={stageId} courseId={courseId} quizzes={quizzes as Parameters<typeof QuizForm>[0]['quizzes']} />
    </div>
  )
}
