'use client'

import Link from 'next/link'
import { deleteStage } from '@/lib/actions/stages'
import type { Stage } from '@/lib/supabase/types'

export function AdminStageActions({ stage, courseId }: { stage: Stage; courseId: string }) {
  const handleDelete = async () => {
    if (!confirm(`「${stage.title}」を削除しますか？`)) return
    await deleteStage(stage.id, courseId)
  }

  return (
    <div className="flex items-center flex-wrap gap-1.5 flex-shrink-0">
      <Link
        href={`/admin/courses/${courseId}/stages/${stage.id}/slides`}
        className="text-xs text-gray-600 hover:text-[#0B2447] px-2.5 py-1.5 border border-[#E8EEF7] rounded-lg hover:bg-[#F2F5FA] transition-colors"
      >
        コンテンツ
      </Link>
      <Link
        href={`/admin/courses/${courseId}/stages/${stage.id}/quizzes`}
        className="text-xs text-gray-600 hover:text-[#0B2447] px-2.5 py-1.5 border border-[#E8EEF7] rounded-lg hover:bg-[#F2F5FA] transition-colors"
      >
        クイズ
      </Link>
      <Link
        href={`/admin/courses/${courseId}/stages/${stage.id}/edit`}
        className="text-xs text-gray-600 hover:text-[#0B2447] px-2.5 py-1.5 border border-[#E8EEF7] rounded-lg hover:bg-[#F2F5FA] transition-colors"
      >
        編集
      </Link>
      <button
        onClick={handleDelete}
        className="text-xs text-red-500 hover:bg-red-50 hover:border-red-200 px-2.5 py-1.5 border border-[#E8EEF7] rounded-lg transition-colors"
      >
        削除
      </button>
    </div>
  )
}
