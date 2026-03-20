'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteCourse, toggleCoursePublished } from '@/lib/actions/courses'
import type { Course } from '@/lib/supabase/types'

export function AdminCourseActions({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false)

  const handleTogglePublish = async () => {
    setLoading(true)
    await toggleCoursePublished(course.id, !course.is_published)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`「${course.title}」を削除しますか？この操作は元に戻せません。`)) return
    setLoading(true)
    await deleteCourse(course.id)
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link
        href={`/admin/courses/${course.id}`}
        className="text-xs text-gray-600 hover:text-[#0B2447] px-3 py-1.5 border border-[#E8EEF7] rounded-lg hover:bg-[#F2F5FA] transition-colors"
      >
        管理
      </Link>
      <Link
        href={`/admin/courses/${course.id}/edit`}
        className="text-xs text-gray-600 hover:text-[#0B2447] px-3 py-1.5 border border-[#E8EEF7] rounded-lg hover:bg-[#F2F5FA] transition-colors"
      >
        編集
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className="text-xs px-3 py-1.5 border border-[#E8EEF7] rounded-lg transition-colors disabled:opacity-50 text-[#C05621] hover:bg-orange-50 hover:border-orange-200"
      >
        {course.is_published ? '非公開にする' : '公開する'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-3 py-1.5 border border-[#E8EEF7] rounded-lg transition-colors disabled:opacity-50 text-red-500 hover:bg-red-50 hover:border-red-200"
      >
        削除
      </button>
    </div>
  )
}
