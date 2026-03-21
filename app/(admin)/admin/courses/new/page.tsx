import Link from 'next/link'
import { CourseForm } from '@/components/admin/CourseForm'
import { ArrowLeft } from 'lucide-react'

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0B2447] bg-white border border-[#E8EEF7] hover:border-[#C8D6EC] hover:bg-[#F2F5FA] px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 mb-5">
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
