'use client'

interface SubjectBarProps {
  data: { name: string; minutes: number; color: string }[]
  maxMinutes: number
}

export function SubjectBar({ data, maxMinutes }: SubjectBarProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map(item => {
        const width = Math.max((item.minutes / maxMinutes) * 100, 4)
        return (
          <div key={item.name} className="flex items-center gap-2 sm:gap-3">
            <span className="w-10 sm:w-14 text-[11px] sm:text-xs text-text-muted flex-shrink-0 truncate" title={item.name}>{item.name}</span>
            <div className="flex-1 h-4 sm:h-5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-8 sm:w-10 text-[11px] sm:text-xs text-text font-medium text-right flex-shrink-0">
              {item.minutes}m
            </span>
          </div>
        )
      })}
    </div>
  )
}
