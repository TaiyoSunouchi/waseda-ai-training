import Link from 'next/link'
import { CourseForm } from '@/components/admin/CourseForm'
import { ArrowLeft } from 'lucide-react'

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B2447] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          コース管理に戻る
        </Link>
        <h1 className="text-xl font-bold text-[#0B2447]">新しいコースを作成</h1>
      </div>
      <div className="max-w-xl">
        <CourseForm />
      </div>
    </div>
  )
}
