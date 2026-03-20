import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'
import type { Profile } from '@/lib/supabase/types'

export async function Navbar() {
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
    <nav className="bg-[#0B2447] border-b border-[#163A6E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">早稲田AI研究会</span>
            <span className="text-blue-300/60 text-xs leading-none hidden sm:block">研修プラットフォーム</span>
          </Link>
          {profile && <UserMenu profile={profile} dark />}
        </div>
      </div>
    </nav>
  )
}
