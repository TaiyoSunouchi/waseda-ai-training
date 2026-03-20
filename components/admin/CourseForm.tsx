'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourse, updateCourse } from '@/lib/actions/courses'
import type { Course } from '@/lib/supabase/types'

interface CourseFormProps {
  course?: Course
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = course
      ? await updateCourse(course.id, formData)
      : await createCourse(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium p-6 space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={course?.title}
          required
          className="input-premium"
          placeholder="コースのタイトルを入力"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={course?.description ?? ''}
          rows={3}
          className="input-premium resize-none"
          placeholder="コースの説明を入力（任意）"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="btn-navy"
        >
          {loading ? '保存中...' : course ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-[#DDE3EE] text-gray-600 text-sm font-medium rounded-xl hover:bg-[#F2F5FA] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
