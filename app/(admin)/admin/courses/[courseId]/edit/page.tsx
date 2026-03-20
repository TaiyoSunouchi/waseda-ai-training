import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourse } from '@/lib/queries/courses'
import { CourseForm } from '@/components/admin/CourseForm'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const { data: course } = await getCourse(courseId)
  if (!course) return notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
          ← コース管理に戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">コースを編集</h1>
      </div>
      <div className="max-w-xl">
        <CourseForm course={course} />
      </div>
    </div>
  )
}
