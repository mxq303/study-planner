'use client'

import { useEffect, useCallback } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { format, isToday, isTomorrow, differenceInDays, parseISO, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useI18n } from '@/lib/i18n'
import { useReviewStore } from '@/stores/reviewStore'
import { useTaskStore } from '@/stores/taskStore'


export default function ReviewsPage() {
  const { t } = useI18n()

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
    return tasks.find(t => t.id === taskId)?.title || '—'
  }

  const getStageLabel = (stage: number): string => {
    return t.reviews.stages[stage - 1] || `Stage ${stage}`
  }

  const getDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr)
    if (isToday(date)) return t.reviews.today
    if (isTomorrow(date)) return t.reviews.tomorrow
    const days = differenceInDays(startOfDay(date), startOfDay(new Date()))
    if (days < 0) return t.reviews.overdue.replace('{0}', String(Math.abs(days)))
    return t.reviews.daysLater.replace('{0}', String(days))
  }

  if (isLoading) {
    return (
    <div className="space-y-4 pb-4 animate-fade-in">
        <h1 className="text-lg font-bold text-text">{t.reviews.title}</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold text-text">{t.reviews.title}</h1>

      {/* Stats card */}
      <Card className="animate-scale-in">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-text-muted">{t.reviews.streak}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{Math.round(rate * 100)}%</p>
            <p className="text-xs text-text-muted">{t.reviews.completionRate}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{total}</p>
            <p className="text-xs text-text-muted">{t.reviews.totalReminders}</p>
          </div>
        </div>
      </Card>

      {/* Today section */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-danger" />
          {t.reviews.todayReview}
          <span className="text-xs text-text-muted font-normal">
            ({todayReminders.length})
          </span>
        </h2>

        {todayReminders.length === 0 ? (
          <EmptyState
            title={t.reviews.noReview}
            description={t.reviews.noReviewHint}
          />
        ) : (
          <div className="space-y-2">
            {todayReminders.map((r, i) => {
              const overdue = differenceInDays(startOfDay(new Date()), startOfDay(parseISO(r.reviewDate))) > 0
              return (
                <div key={r.id} className={`animate-slide-up stagger-${(i % 8) + 1}`}>
                  <Card
                    className={cn(
                      'flex items-center gap-3 card-hover',
                      overdue && 'border-danger/30'
                    )}
                  >
                  <button
                    onClick={() => handleComplete(r.id)}
                    className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 hover:border-success hover:bg-success/10 transition animate-check-pop"
                  >
                    <Check className="w-3.5 h-3.5 text-success opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-text">
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
                    className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary-dark transition flex-shrink-0 animate-check-pop"
                  >
                    {t.reviews.completeReview}
                  </button>
                </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming section */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-primary" />
          {t.reviews.upcoming}
          <span className="text-xs text-text-muted font-normal">
            ({upcomingReminders.length})
          </span>
        </h2>

        {upcomingReminders.length === 0 ? (
          <EmptyState
            title={t.reviews.noReview}
            description={t.reviews.noReviewHint}
          />
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map((r, i) => (
              <div key={r.id} className={`animate-slide-up stagger-${(i % 8) + 1}`}>
                <Card className="flex items-center gap-3 card-hover">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{r.stage}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-text">
                    {getTaskTitle(r.taskId)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {getStageLabel(r.stage)} · {format(parseISO(r.reviewDate), 'MM/dd')} {getDateLabel(r.reviewDate)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
