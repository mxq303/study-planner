'use client'

interface HeatmapProps {
  data: Record<string, number>
  dayLabels?: string[]
}

const DEFAULT_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getIntensityColor(minutes: number, max: number): string {
  if (minutes === 0) return 'bg-surface'
  if (max === 0) return 'bg-surface'
  const ratio = minutes / max
  if (ratio <= 0.25) return 'bg-primary/20'
  if (ratio <= 0.5) return 'bg-primary/40'
  if (ratio <= 0.75) return 'bg-primary/60'
  return 'bg-primary'
}

export function Heatmap({ data, dayLabels }: HeatmapProps) {
  const entries = Object.entries(data)
  const values = entries.map(([, v]) => v)
  const max = Math.max(...values, 1)
  const labels = dayLabels || DEFAULT_LABELS

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 sm:gap-2">
        {entries.map(([date, minutes], i) => (
          <div key={date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className={`w-full min-h-[2rem] sm:min-h-[2.5rem] aspect-square rounded-lg ${getIntensityColor(minutes, max)}`}
              title={`${minutes}分钟`}
            />
            <span className="text-[10px] sm:text-xs text-text-muted">{labels[i]}</span>
            {minutes > 0 && (
              <span className="text-[10px] sm:text-xs text-text font-medium truncate w-full text-center">{minutes}m</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-text-muted">
        <span>少</span>
        <div className="w-3 h-3 rounded bg-surface" />
        <div className="w-3 h-3 rounded bg-primary/20" />
        <div className="w-3 h-3 rounded bg-primary/40" />
        <div className="w-3 h-3 rounded bg-primary/60" />
        <div className="w-3 h-3 rounded bg-primary" />
        <span>多</span>
      </div>
    </div>
  )
}
