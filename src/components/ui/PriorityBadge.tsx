import { cn, getPriorityLabel } from '@/lib/utils'

const priorityColors: Record<number, string> = {
  1: 'bg-gray-100 text-gray-500',
  2: 'bg-blue-50 text-blue-600',
  3: 'bg-yellow-50 text-yellow-600',
  4: 'bg-orange-50 text-orange-600',
  5: 'bg-red-50 text-red-600',
}

export function PriorityBadge({ priority, className }: { priority: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
        priorityColors[priority] || priorityColors[3],
        className
      )}
    >
      {getPriorityLabel(priority)}
    </span>
  )
}
