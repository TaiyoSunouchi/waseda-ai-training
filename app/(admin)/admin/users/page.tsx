import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUsers } from '@/lib/queries/users'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: users } = await getUsers()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー一覧</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">氏名</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">メールアドレス</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">ロール</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">登録日時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{u.full_name ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                    {u.role === 'admin' ? '管理者' : '研修者'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="text-center py-8 text-gray-500 text-sm">ユーザーがいません。</p>
        )}
      </div>
    </div>
  )
}
