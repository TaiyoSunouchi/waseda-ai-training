import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStage } from '@/lib/queries/stages'
import { RichTextViewer } from '@/components/editor/RichTextViewer'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default async function TraineeContentPage({
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

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-6">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          コースに戻る
        </Link>
        <h1 className="text-2xl font-bold text-[#0B2447]">{stage.title}</h1>
        {stage.description && (
          <p className="text-gray-500 mt-1 text-sm">{stage.description}</p>
        )}
      </div>

      <div className="card-premium px-4 py-6 sm:px-8 sm:py-10 mb-6">
        <RichTextViewer content={stage.content} />
      </div>

      <div className="flex justify-end">
        <Link
          href={`/courses/${courseId}/stages/${stageId}/quiz`}
          className="btn-orange inline-flex items-center gap-2"
        >
          クイズに進む
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
