'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Timer, Brain, User, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()
  const tabs = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/tasks', label: t.nav.tasks, icon: CheckSquare },
    { href: '/pomodoro', label: t.nav.pomodoro, icon: Timer },
    { href: '/reviews', label: t.nav.reviews, icon: Brain },
    { href: '/stats', label: t.nav.stats, icon: BarChart3 },
    { href: '/settings', label: t.nav.settings, icon: User },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 card-bg border-t z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center overflow-x-auto scrollbar-hide">
        {tabs.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center px-1.5 py-1.5 rounded-lg transition-colors min-w-[3.5rem] flex-shrink-0',
                active ? 'text-primary' : 'text-text-muted hover:text-text'
              )}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] mt-0.5 leading-tight whitespace-nowrap">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
