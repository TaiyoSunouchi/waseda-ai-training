import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCourses } from '@/lib/queries/courses'
import { CourseList } from '@/components/admin/CourseList'
import { Plus, BookOpen } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courses } = await getCourses()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2447]">コース管理</h1>
          <p className="text-gray-500 mt-1 text-sm">コースの作成・編集・公開を管理します</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="btn-navy flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          新しいコース
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">コースがまだありません。</p>
          <Link href="/admin/courses/new" className="btn-navy inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            最初のコースを作成する
          </Link>
        </div>
      ) : (
        <CourseList courses={courses} />
      )}
    </div>
  )
}
