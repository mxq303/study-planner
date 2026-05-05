import { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  backHref?: string
  className?: string
}

export function PageHeader({ title, subtitle, action, backHref, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-5', className)}>
      <div>
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              className="p-1 -ml-1 rounded-lg hover:bg-bg text-text-muted hover:text-text transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="text-xl font-bold text-text">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
