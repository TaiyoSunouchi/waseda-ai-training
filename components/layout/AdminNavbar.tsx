import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'
import { AdminMobileMenu } from './AdminMobileMenu'
import type { Profile } from '@/lib/supabase/types'

const navItems = [
  { href: '/admin/dashboard', label: 'コース管理' },
  { href: '/admin/users', label: 'ユーザー一覧' },
  { href: '/admin/progress', label: '進捗確認' },
]

export async function AdminNavbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="bg-[#0B2447] border-b border-[#163A6E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">早稲田AI研究会</span>
              <span className="text-[#C05621] text-xs font-semibold bg-[#C05621]/15 px-2 py-0.5 rounded-md border border-[#C05621]/30 hidden sm:block">管理者</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-blue-200/60 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminMobileMenu />
            {profile && <UserMenu profile={profile} dark />}
          </div>
        </div>
      </div>
    </nav>
  )
}
