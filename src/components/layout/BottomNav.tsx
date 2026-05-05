'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Timer, Brain, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: '首页', icon: Home },
  { href: '/tasks', label: '任务', icon: CheckSquare },
  { href: '/pomodoro', label: '番茄钟', icon: Timer },
  { href: '/reviews', label: '复习', icon: Brain },
  { href: '/settings', label: '我的', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="max-w-3xl mx-auto flex justify-around py-1">
        {tabs.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors min-w-0',
                active ? 'text-primary' : 'text-text-muted hover:text-text'
              )}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
