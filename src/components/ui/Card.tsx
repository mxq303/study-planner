'use client'

import { cn } from '@/lib/utils'
import { usePreferenceStore } from '@/stores/preferenceStore'

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { preferences } = usePreferenceStore()
  const cardStyle = preferences?.cardStyle || 'solid'

  const styleMap: Record<string, string> = {
    solid: '!bg-surface !rounded-2xl !border !border-border !p-4 !shadow-sm card-hover',
    glass: '!glass-card !p-4 card-hover',
    outlined: '!bg-transparent !rounded-2xl !border-2 !border-border !p-4 card-hover',
  }

  return (
    <div
      className={cn(
        styleMap[cardStyle] || styleMap['solid'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
