import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublishedCourses } from '@/lib/queries/courses'
import { getStagesWithProgress } from '@/lib/queries/stages'
import { Progress } from '@/components/ui/progress'
import { computeCourseProgress } from '@/lib/utils/progress'
import { BookOpen, ChevronRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courses } = await getPublishedCourses()

  const coursesWithProgress = await Promise.all(
    (courses ?? []).map(async (course) => {
      const { data: stages } = await getStagesWithProgress(course.id, user.id)
      const progress = computeCourseProgress(stages ?? [])
      return { course, stages: stages ?? [], progress }
    })
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B2447]">コース一覧</h1>
        <p className="text-gray-500 mt-1 text-sm">受講可能なコースを選択してください</p>
      </div>

      {coursesWithProgress.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">現在公開中のコースはありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coursesWithProgress.map(({ course, stages, progress }) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group">
              <div className="card-premium-hover p-6 h-full flex flex-col">
                {/* アイコン */}
                <div className="w-11 h-11 rounded-xl bg-[#0B2447]/8 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5 text-[#0B2447]" />
                </div>

                {/* タイトル */}
                <h2 className="font-bold text-[#0B2447] text-lg leading-snug group-hover:text-[#163A6E] transition-colors">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-gray-500 text-sm mt-1.5 flex-1 line-clamp-2">{course.description}</p>
                )}

                {/* 進捗 */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{stages.length} ステージ</span>
                    <span className="font-medium text-[#0B2447]">{progress}% 完了</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* 矢印 */}
                <div className="flex items-center justify-end mt-4">
                  <span className="text-xs text-[#C05621] font-medium group-hover:underline">
                    受講する
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#C05621]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
