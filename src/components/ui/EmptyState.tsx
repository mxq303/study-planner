import { ReactNode } from 'react'
import { ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 animate-fade-in', className)}>
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon || <ClipboardList className="w-8 h-8 text-primary" />}
      </div>
      <p className="text-text font-medium text-sm mb-1">{title}</p>
      {description && (
        <p className="text-text-muted text-xs text-center mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
