'use client'
import { Card } from '@/components/ui/Card'

interface ShareCardProps {
  date: string
  totalMinutes: number
  completedTasks: number
  pomodoroCount: number
  topSubject: string
}

export function ShareCard({ date, totalMinutes, completedTasks, pomodoroCount, topSubject }: ShareCardProps) {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <Card className="w-[320px] bg-gradient-to-br from-primary to-primary-dark text-white border-0">
      <div className="text-center">
        <p className="text-sm opacity-80 mb-1">{date}</p>
        <h3 className="text-2xl font-bold mb-4">📚 学习打卡</h3>
        <div className="text-5xl font-bold mb-1">
          {hours > 0 ? `${hours}h` : ''}{mins > 0 ? `${mins}m` : ''}
        </div>
        <p className="text-sm opacity-80 mb-6">今日学习时长</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center bg-white/15 rounded-xl py-3">
        <div>
          <p className="text-lg font-bold">{completedTasks}</p>
          <p className="text-[10px] opacity-70">完成任务</p>
        </div>
        <div>
          <p className="text-lg font-bold">{pomodoroCount}</p>
          <p className="text-[10px] opacity-70">番茄钟</p>
        </div>
        <div>
          <p className="text-lg font-bold truncate">{topSubject || '-'}</p>
          <p className="text-[10px] opacity-70">最多科目</p>
        </div>
      </div>
      <p className="text-center text-[10px] opacity-50 mt-4">智习助手 · AI学习规划</p>
    </Card>
  )
}
