'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'コース管理' },
  { href: '/admin/users', label: 'ユーザー一覧' },
  { href: '/admin/progress', label: '進捗確認' },
]

export function AdminMobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-white/80 hover:text-white transition-colors"
        aria-label="メニュー"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-[#0B2447] border-t border-[#163A6E] z-50 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 text-sm text-blue-200/80 hover:text-white hover:bg-white/10 border-b border-[#163A6E] last:border-0 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
