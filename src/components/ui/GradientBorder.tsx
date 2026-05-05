'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientBorderProps {
  children: ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export function GradientBorder({ children, className }: GradientBorderProps) {
  return (
    <div className={cn('relative rounded-2xl p-[1.5px]', className)}>
      <div className="absolute inset-0 rounded-2xl animate-gradient-rotate bg-[conic-gradient(from_var(--angle),var(--accent,#6366f1),#a855f7,#6366f1)] opacity-60" />
      <div className="relative rounded-2xl card-bg">{children}</div>
    </div>
  )
}
