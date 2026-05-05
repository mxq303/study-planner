'use client'

interface HeatmapProps {
  data: Record<string, number>
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getIntensityColor(minutes: number, max: number): string {
  if (minutes === 0) return 'bg-gray-100'
  if (max === 0) return 'bg-gray-100'
  const ratio = minutes / max
  if (ratio <= 0.25) return 'bg-primary/20'
  if (ratio <= 0.5) return 'bg-primary/40'
  if (ratio <= 0.75) return 'bg-primary/60'
  return 'bg-primary'
}

export function Heatmap({ data }: HeatmapProps) {
  const entries = Object.entries(data)
  const values = entries.map(([, v]) => v)
  const max = Math.max(...values, 1)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {entries.map(([date, minutes], i) => (
          <div key={date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full aspect-square rounded-lg ${getIntensityColor(minutes, max)}`}
              title={`${minutes}分钟`}
            />
            <span className="text-[10px] text-text-muted">{DAY_LABELS[i]}</span>
            {minutes > 0 && (
              <span className="text-[10px] text-text font-medium">{minutes}m</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-text-muted">
        <span>少</span>
        <div className="w-3 h-3 rounded bg-gray-100" />
        <div className="w-3 h-3 rounded bg-primary/20" />
        <div className="w-3 h-3 rounded bg-primary/40" />
        <div className="w-3 h-3 rounded bg-primary/60" />
        <div className="w-3 h-3 rounded bg-primary" />
        <span>多</span>
      </div>
    </div>
  )
}
