'use client'

import { useEffect, useCallback } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { format, isToday, isTomorrow, differenceInDays, parseISO, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useReviewStore } from '@/stores/reviewStore'
import { useTaskStore } from '@/stores/taskStore'
import { EBBINGHAUS_STAGES } from '@/types'

function getStageLabel(stage: number): string {
  const s = EBBINGHAUS_STAGES.find(e => e.stage === stage)
  return s?.label || `第${stage}阶段`
}

function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return '今天'
  if (isTomorrow(date)) return '明天'
  const days = differenceInDays(startOfDay(date), startOfDay(new Date()))
  if (days < 0) return `逾期${Math.abs(days)}天`
  return `${days}天后`
}

export default function ReviewsPage() {
  const {
    isLoading,
    loadReminders,
    completeReminder,
    getTodayReminders,
    getUpcomingReminders,
    getStreakInfo,
  } = useReviewStore()
  const { tasks, loadTasks } = useTaskStore()

  useEffect(() => {
    loadReminders()
    loadTasks()
  }, [loadReminders, loadTasks])

  const handleComplete = useCallback(async (id: string) => {
    await completeReminder(id)
  }, [completeReminder])

  const todayReminders = getTodayReminders()
  const upcomingReminders = getUpcomingReminders(7)
  const { streak, rate, total } = getStreakInfo()

  const getTaskTitle = (taskId: string) => {
    return tasks.find(t => t.id === taskId)?.title || '未知任务'
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-lg font-bold">艾宾浩斯复习</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">艾宾浩斯复习</h1>

      {/* Stats card */}
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-text-muted">复习连击</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{Math.round(rate * 100)}%</p>
            <p className="text-xs text-text-muted">完成率</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{total}</p>
            <p className="text-xs text-text-muted">总提醒</p>
          </div>
        </div>
      </Card>

      {/* Today section */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-danger" />
          今日待复习
          <span className="text-xs text-text-muted font-normal">
            ({todayReminders.length})
          </span>
        </h2>

        {todayReminders.length === 0 ? (
          <EmptyState
            title="暂无待复习内容"
            description="完成学习任务后将自动生成复习提醒"
          />
        ) : (
          <div className="space-y-2">
            {todayReminders.map(r => {
              const overdue = differenceInDays(startOfDay(new Date()), startOfDay(parseISO(r.reviewDate))) > 0
              return (
                <Card
                  key={r.id}
                  className={cn(
                    'flex items-center gap-3',
                    overdue && 'border-danger/30'
                  )}
                >
                  <button
                    onClick={() => handleComplete(r.id)}
                    className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 hover:border-success hover:bg-success/10 transition"
                  >
                    <Check className="w-3.5 h-3.5 text-success opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getTaskTitle(r.taskId)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {getStageLabel(r.stage)}
                      {overdue && (
                        <span className="text-danger ml-2">
                          {getDateLabel(r.reviewDate)}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleComplete(r.id)}
                    className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary-dark transition flex-shrink-0"
                  >
                    完成
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming section */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-primary" />
          即将到来
          <span className="text-xs text-text-muted font-normal">
            ({upcomingReminders.length})
          </span>
        </h2>

        {upcomingReminders.length === 0 ? (
          <EmptyState
            title="暂无即将到来的复习"
            description="未来7天内没有需要复习的内容"
          />
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map(r => (
              <Card key={r.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{r.stage}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getTaskTitle(r.taskId)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {getStageLabel(r.stage)} · {format(parseISO(r.reviewDate), 'MM/dd')} {getDateLabel(r.reviewDate)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
