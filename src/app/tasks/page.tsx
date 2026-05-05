'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, Circle, Clock, Calendar, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
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
      <Card className="card-hover active:scale-[0.98] transition-transform hover:shadow-md">
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
              className="animate-check-pop text-text-muted hover:text-success transition-colors mt-0.5 flex-shrink-0"
            >
              <Circle className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {subject && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
              )}
              {subject && (
                <span className="text-xs text-text-muted">{subject.name}</span>
              )}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                  task.priority >= 5 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  task.priority === 4 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                  task.priority === 3 ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  task.priority === 2 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-surface text-text-muted'
                )}
              >
                {priorityLabels[task.priority - 1] || priorityLabels[2]}
              </span>
            </div>
            <p className={cn(
              'text-sm font-medium mt-1',
              task.status === 'completed' && 'line-through text-text-muted'
            )}>
              {task.title}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getTimeStr(task.estimatedMinutes, minutesLabel)}
              </span>
              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {format(new Date(task.deadline), 'M/d')}
                </span>
              )}
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px]',
                task.status === 'completed' ? 'bg-success/10 text-success' :
                task.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                'bg-surface text-text-muted'
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
    console.log('Moved from', result.source.index, 'to', result.destination.index)
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
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </Link>
        }
      />

      <div className="flex gap-1 p-1 card-bg rounded-xl border border-border mb-4 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'animate-scale-in flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            )}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
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
                className="inline-flex items-center gap-1 text-xs text-white bg-primary px-4 py-2 rounded-full font-medium"
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
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'opacity-80 shadow-lg rounded-xl' : ''}
                      >
                        <div className="flex items-center gap-1">
                          <div {...provided.dragHandleProps} className="p-1 text-text-muted hover:text-text cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
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
        <div ref={listRef} className="space-y-2">
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
