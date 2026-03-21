import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/queries/courses'
import { getStagesWithProgress } from '@/lib/queries/stages'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Lock, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await getCourse(courseId)
  if (!course || !course.is_published) return notFound()

  const { data: stages } = await getStagesWithProgress(courseId, user.id)

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2447] bg-white border border-[#E8EEF7] hover:border-[#C8D6EC] hover:bg-[#F2F5FA] px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 mb-5">
          <ArrowLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-[#0B2447]">{course.title}</h1>
        {course.description && (
          <p className="text-gray-500 mt-1.5">{course.description}</p>
        )}
      </div>

      <div className="space-y-3">
        {(stages ?? []).map((stage, idx) => {
          const isAccessible = stage.isAccessible
          const status = stage.user_progress?.status

          return (
            <div
              key={stage.id}
              className={`card-premium p-5 flex items-center justify-between gap-4 ${
                isAccessible ? 'hover:shadow-md hover:shadow-[#0B2447]/8 hover:-translate-y-0.5 transition-all duration-200' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* ステップ番号 */}
                <span className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                  status === 'passed'
                    ? 'bg-green-100 text-green-700'
                    : isAccessible
                    ? 'bg-[#0B2447]/10 text-[#0B2447]'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <p className="font-semibold text-[#0B2447] truncate">{stage.title}</p>
                  {stage.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{stage.description}</p>
                  )}
                  {stage.user_progress && (
                    <p className="text-xs text-gray-400 mt-1">
                      ベストスコア: <span className="font-medium text-gray-600">{stage.user_progress.best_score}%</span> / 合格ライン: {stage.pass_threshold}%
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={status} />
                {isAccessible ? (
                  <Link
                    href={`/courses/${courseId}/stages/${stage.id}/slides`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#C05621] hover:text-[#9a3b0b] transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    学習する
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Lock className="w-4 h-4 text-gray-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
