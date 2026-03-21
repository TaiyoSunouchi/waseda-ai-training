import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourse } from '@/lib/queries/courses'
import { getStages } from '@/lib/queries/stages'
import { Badge } from '@/components/ui/badge'
import { StageList } from '@/components/admin/StageList'
import { ArrowLeft, Plus, Layers } from 'lucide-react'

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const { data: course } = await getCourse(courseId)
  if (!course) return notFound()

  const { data: stages } = await getStages(courseId)

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2447] bg-white border border-[#E8EEF7] hover:border-[#C8D6EC] hover:bg-[#F2F5FA] px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 mb-5">
          <ArrowLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0B2447]">{course.title}</h1>
          <Badge variant={course.is_published ? 'success' : 'secondary'}>
            {course.is_published ? '公開中' : '非公開'}
          </Badge>
        </div>
        {course.description && (
          <p className="text-gray-500 mt-1.5 text-sm">{course.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#0B2447]">ステージ一覧</h2>
        <Link
          href={`/admin/courses/${courseId}/stages/new`}
          className="btn-navy inline-flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          ステージ追加
        </Link>
      </div>

      {!stages || stages.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">ステージがまだありません。</p>
          <Link
            href={`/admin/courses/${courseId}/stages/new`}
            className="btn-navy inline-flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            最初のステージを追加する
          </Link>
        </div>
      ) : (
        <StageList stages={stages} courseId={courseId} />
      )}
    </div>
  )
}
