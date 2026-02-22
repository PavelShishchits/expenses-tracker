'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Tag, RefreshCcw, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/reports', label: 'Reports', Icon: BarChart2 },
  { href: '/categories', label: 'Categories', Icon: Tag },
  { href: '/recurring', label: 'Recurring', Icon: RefreshCcw },
  { href: '/account', label: 'Account', Icon: User },
] as const

export default function Navigation() {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white md:hidden">
        <div className="flex">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white px-3 py-6">
        <div className="mb-6 px-3">
          <span className="text-base font-bold text-gray-900">Expenses</span>
        </div>
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
