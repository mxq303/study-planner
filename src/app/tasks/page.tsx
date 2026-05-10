'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, Circle, Clock, Calendar, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { db } from '@/lib/storage'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { TaskStatus } from '@/types'

function getTimeStr(minutes: number, minLabel: string): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} ${minLabel}`
  if (m === 0) return `${h}h`
  return `${h}h ${m} ${minLabel}`
}

const priorityBadgeClass = (priority: number): string => {
  switch (priority) {
    case 5:
      return 'bg-danger/15 text-danger ring-1 ring-danger/20'
    case 4:
      return 'bg-warning/15 text-warning ring-1 ring-warning/20'
    case 3:
      return 'bg-primary/15 text-primary ring-1 ring-primary/20'
    case 2:
      return 'bg-[var(--accent-light)]/15 text-[var(--accent-light)] ring-1 ring-[var(--accent-light)]/20'
    default:
      return 'bg-surface-secondary text-text-muted ring-1 ring-border'
  }
}

function TaskCard({
  task,
  subject,
  onComplete,
  statusLabel,
  minutesLabel,
  priorityLabels,
}: {
  task: import('@/types').Task
  subject?: import('@/types').Subject
  onComplete: () => void
  statusLabel: string
  minutesLabel: string
  priorityLabels: string[]
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block"
    >
      <Card className="card-hover active:scale-[0.98] transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
          ) : (
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                onComplete()
              }}
              className="animate-check-pop text-text-muted hover:text-success transition-colors duration-200 mt-0.5 flex-shrink-0"
            >
              <Circle className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {subject && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
              )}
              {subject && (
                <span className="text-xs font-medium text-text-secondary">{subject.name}</span>
              )}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                  priorityBadgeClass(task.priority)
                )}
              >
                {priorityLabels[task.priority - 1] || priorityLabels[2]}
              </span>
            </div>
            <p className={cn(
              'text-sm font-semibold mt-1.5 leading-snug',
              task.status === 'completed' && 'line-through text-text-muted'
            )}>
              {task.title}
            </p>
            <div className="flex items-center gap-3 mt-2.5 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {getTimeStr(task.estimatedMinutes, minutesLabel)}
              </span>
              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {format(new Date(task.deadline), 'M/d')}
                </span>
              )}
              <span className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-medium',
                task.status === 'completed' ? 'bg-success/10 text-success' :
                task.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                'bg-surface-secondary text-text-muted'
              )}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function TasksPage() {
  const { t } = useI18n()
  const { tasks, loadTasks, completeTask } = useTaskStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')
  const [listRef] = useAutoAnimate()

  useEffect(() => {
    loadTasks()
    loadSubjects()
  }, [loadTasks, loadSubjects])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return

    const reordered = Array.from(tasks)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    const updated = reordered.map((task, index) => ({ ...task, sortOrder: index }))

    updated.forEach((task) => {
      db.tasks.update(task.id, { sortOrder: task.sortOrder }).catch(console.error)
    })

    useTaskStore.setState({ tasks: updated })
  }

  const STATUS_TABS: { key: TaskStatus | 'all'; label: string }[] = [
    { key: 'all', label: t.tasks.all },
    { key: 'pending', label: t.tasks.pending },
    { key: 'in_progress', label: t.tasks.inProgress },
    { key: 'completed', label: t.tasks.completed },
  ]

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks
    return tasks.filter(t => t.status === activeTab)
  }, [tasks, activeTab])

  const getSubjectById = (id?: string) => subjects.find(s => s.id === id)

  const statusLabelMap: Record<TaskStatus, string> = {
    pending: t.tasks.status.pending,
    in_progress: t.tasks.status.in_progress,
    completed: t.tasks.status.completed,
  }

  return (
    <div className="pb-4 animate-fade-in">
      <PageHeader
        title={t.tasks.title}
        action={
          <Link
            href="/tasks/new"
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-all duration-200 hover:shadow-md hover:brightness-105"
          >
            <Plus className="w-5 h-5" />
          </Link>
        }
      />

      <div className="flex gap-1 p-1 bg-surface-secondary/60 rounded-xl border border-border mb-5 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'animate-scale-in flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm ring-1 ring-primary/30'
                : 'text-text-muted hover:text-text hover:bg-surface'
            )}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className={cn(
                'ml-1 text-xs',
                activeTab === tab.key ? 'opacity-80' : 'opacity-60'
              )}>
                ({tasks.filter(t => tab.key === 'all' ? true : t.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title={t.tasks.noTasks}
          description={activeTab === 'all' ? t.tasks.noTasksHint : t.tasks.noTasks}
          action={
            activeTab === 'all' ? (
              <Link
                href="/tasks/new"
                className="inline-flex items-center gap-1.5 text-xs text-white bg-primary px-4 py-2.5 rounded-full font-medium transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t.tasks.add}
              </Link>
            ) : undefined
          }
        />
      ) : (activeTab === 'all' || activeTab === 'pending') ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="task-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2.5">
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'transition-all duration-200',
                          snapshot.isDragging && 'opacity-90'
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            {...provided.dragHandleProps}
                            className="p-2 -ml-1 text-text-muted/60 hover:text-text cursor-grab active:cursor-grabbing transition-colors duration-150 touch-manipulation"
                            role="button"
                            aria-label="Drag to reorder"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <TaskCard
                              task={task}
                              subject={getSubjectById(task.subjectId)}
                              onComplete={() => completeTask(task.id)}
                              statusLabel={statusLabelMap[task.status]}
                              minutesLabel={t.tasks.minutes}
                              priorityLabels={t.tasks.priorityLevels}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div ref={listRef} className="space-y-2.5">
          {filteredTasks.map((task, i) => (
            <div key={task.id} className={`animate-slide-up stagger-${(i % 8) + 1}`}>
              <TaskCard
                task={task}
                subject={getSubjectById(task.subjectId)}
                onComplete={() => completeTask(task.id)}
                statusLabel={statusLabelMap[task.status]}
                minutesLabel={t.tasks.minutes}
                priorityLabels={t.tasks.priorityLevels}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
