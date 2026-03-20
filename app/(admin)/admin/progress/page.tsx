import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllProgress } from '@/lib/queries/progress'
import { StatusBadge } from '@/components/common/StatusBadge'

export default async function AdminProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await getAllProgress()

  type ProgressRow = {
    id: string
    user_id: string
    stage_id: string
    status: 'not_started' | 'in_progress' | 'passed'
    best_score: number
    attempts_count: number
    updated_at: string
    profiles: { full_name: string | null; email: string } | null
    stages: {
      title: string
      courses: { title: string } | null
    } | null
  }

  const rows = (progress ?? []) as unknown as ProgressRow[]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">受講者進捗</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">受講者</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">コース</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">ステージ</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">状態</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">ベストスコア</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">受験回数</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">最終更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {p.profiles?.full_name ?? p.profiles?.email ?? '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.stages?.courses?.title ?? '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.stages?.title ?? '-'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {p.best_score}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.attempts_count}回
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(p.updated_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center py-8 text-gray-500 text-sm">進捗データがありません。</p>
        )}
      </div>
    </div>
  )
}
