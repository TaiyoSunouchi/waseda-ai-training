'use client'

import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/lib/supabase/types'

interface UserMenuProps {
  profile: Profile
  dark?: boolean
}

export function UserMenu({ profile, dark = false }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <span className={`text-sm font-medium leading-tight ${dark ? 'text-white' : 'text-gray-800'}`}>
          {profile.full_name ?? profile.email}
        </span>
        <span className={`text-xs leading-tight ${dark ? 'text-blue-300/60' : 'text-gray-500'}`}>
          {profile.role === 'admin' ? '管理者' : '研修者'}
        </span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
            dark
              ? 'border-white/20 text-blue-200/70 hover:bg-white/10 hover:text-white'
              : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          ログアウト
        </button>
      </form>
    </div>
  )
}
