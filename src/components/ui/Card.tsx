import { cn } from '@/lib/utils'

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border p-4 shadow-sm card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
