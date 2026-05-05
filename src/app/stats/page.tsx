'use client'

import { useEffect, useState } from 'react'
import { Flame, CheckCircle, Timer, Zap } from 'lucide-react'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
  differenceInDays,
  startOfDay,
  subDays,
} from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Heatmap } from '@/components/stats/Heatmap'
import { SubjectBar } from '@/components/stats/SubjectBar'
import { useTaskStore } from '@/stores/taskStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useSubjectStore } from '@/stores/subjectStore'

type TimeRange = 'week' | 'month' | 'all'

export default function StatsPage() {
  const { tasks, loadTasks } = useTaskStore()
  const { sessions, loadSessions } = usePomodoroStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const [range, setRange] = useState<TimeRange>('week')

  useEffect(() => {
    loadTasks()
    loadSessions()
    loadSubjects()
  }, [loadTasks, loadSessions, loadSubjects])

  const now = new Date()
  const today = startOfDay(now)

  let filterDate: Date
  if (range === 'week') filterDate = startOfWeek(now, { weekStartsOn: 1 })
  else if (range === 'month') filterDate = startOfMonth(now)
  else filterDate = new Date(0)

  const filteredSessions = sessions.filter(s => {
    return s.isCompleted && new Date(s.startedAt) >= filterDate
  })

  const filteredTasks = tasks.filter(t => {
    if (t.status !== 'completed') return false
    if (range === 'all') return true
    return t.completedAt && new Date(t.completedAt) >= filterDate
  })

  const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const pomodoroCount = filteredSessions.length
  const tasksCompleted = filteredTasks.length

  let streak = 0
  let checkDate = today
  const studyDates = new Set<string>()
  sessions
    .filter(s => s.isCompleted)
    .forEach(s => studyDates.add(format(startOfDay(parseISO(s.startedAt)), 'yyyy-MM-dd')))

  for (let i = 0; i < 365; i++) {
    const d = format(checkDate, 'yyyy-MM-dd')
    if (studyDates.has(d)) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  // Heatmap data (this week)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const heatmapData: Record<string, number> = {}
  weekDays.forEach(d => {
    const key = format(d, 'yyyy-MM-dd')
    heatmapData[key] = sessions
      .filter(s => {
        if (!s.isCompleted) return false
        return isSameDay(startOfDay(parseISO(s.startedAt)), d)
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0)
  })

  // Subject distribution
  const subjectMinutes: Record<string, { name: string; minutes: number; color: string }> = {}
  sessions
    .filter(s => s.isCompleted && s.taskId && s.mode === 'focus')
    .forEach(s => {
      const task = tasks.find(t => t.id === s.taskId)
      if (!task?.subjectId) return
      const subject = subjects.find(sub => sub.id === task.subjectId)
      if (!subject) return
      const key = subject.id
      if (!subjectMinutes[key]) {
        subjectMinutes[key] = { name: subject.name, minutes: 0, color: subject.color }
      }
      subjectMinutes[key].minutes += s.durationMinutes
    })

  const subjectData = Object.values(subjectMinutes).sort((a, b) => b.minutes - a.minutes)
  const maxSubjectMinutes = Math.max(...subjectData.map(s => s.minutes), 1)

  // Daily average
  let dayCount = 1
  if (range === 'week') dayCount = 7
  else if (range === 'month') dayCount = differenceInDays(now, filterDate) + 1
  else {
    const firstSession = sessions.filter(s => s.isCompleted).sort((a, b) =>
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )[0]
    if (firstSession) {
      dayCount = differenceInDays(now, startOfDay(parseISO(firstSession.startedAt))) + 1
    }
  }
  const avgMinutes = Math.round(totalMinutes / Math.max(dayCount, 1))

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">学习统计</h1>

      {/* Time range selector */}
      <div className="flex gap-1 bg-gray-100 rounded-full p-1">
        {[
          { key: 'week' as const, label: '本周' },
          { key: 'month' as const, label: '本月' },
          { key: 'all' as const, label: '全部' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setRange(item.key)}
            className={`flex-1 py-1.5 rounded-full text-sm font-medium transition ${
              range === item.key ? 'bg-white text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats summary grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalHours}h</p>
            <p className="text-xs text-text-muted">总学习时长</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xl font-bold">{tasksCompleted}</p>
            <p className="text-xs text-text-muted">完成任务</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Timer className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xl font-bold">{pomodoroCount}</p>
            <p className="text-xs text-text-muted">番茄钟数</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-danger" />
          </div>
          <div>
            <p className="text-xl font-bold">{streak}天</p>
            <p className="text-xs text-text-muted">连续学习</p>
          </div>
        </Card>
      </div>

      {/* Weekly heatmap */}
      <Card>
        <h3 className="text-sm font-medium mb-3">本周学习热力图</h3>
        <Heatmap data={heatmapData} />
      </Card>

      {/* Subject distribution */}
      <Card>
        <h3 className="text-sm font-medium mb-3">科目分布</h3>
        {subjectData.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">暂无数据</p>
        ) : (
          <SubjectBar data={subjectData} maxMinutes={maxSubjectMinutes} />
        )}
      </Card>

      {/* Daily average */}
      <Card>
        <h3 className="text-sm font-medium mb-3">每日平均</h3>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary">{avgMinutes}</span>
          <span className="text-sm text-text-muted pb-1">分钟/天</span>
        </div>
        <p className="text-xs text-text-muted mt-1">
          {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}统计
        </p>
      </Card>
    </div>
  )
}
