'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Timer, Brain, User, BarChart3, BookOpen, Cloud, CloudOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { isLoggedIn, getStoredUser } from '@/lib/sync'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const items = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/tasks', label: t.nav.tasks, icon: CheckSquare },
    { href: '/pomodoro', label: t.nav.pomodoro, icon: Timer },
    { href: '/reviews', label: t.nav.reviews, icon: Brain },
    { href: '/stats', label: '统计', icon: BarChart3 },
    { href: '/settings', label: t.nav.settings, icon: User },
  ]
  const loggedIn = typeof window !== 'undefined' && isLoggedIn()
  const user = typeof window !== 'undefined' ? getStoredUser() : null

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 card-bg border-r z-40">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">{t.common.appName}</h1>
          <p className="text-[10px] text-text-muted leading-tight">{t.common.appDesc}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-hover hover:text-text'
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        {loggedIn && user ? (
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-text-muted flex items-center gap-1">
                <Cloud className="w-3 h-3" /> 已同步
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-xs text-text-muted">
            <CloudOff className="w-4 h-4" />
            <span>本地存储</span>
          </div>
        )}
      </div>
    </aside>
  )
}
