'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Loader2, Trash2, Check, X, Clock, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { useI18n } from '@/lib/i18n'
import type { AITaskSuggestion } from '@/types'

function getTimeStr(minutes: number, minLabel: string): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} ${minLabel}`
  if (m === 0) return `${h}h`
  return `${h}h ${m} ${minLabel}`
}

export default function DecomposePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t, locale } = useI18n()
  const { tasks, addSubtasks, getSubtasks, deleteTask } = useTaskStore()
  const { subjects } = useSubjectStore()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([])

  const task = tasks.find(t => t.id === id)
  const subject = subjects.find(s => s.id === task?.subjectId)
  const existingSubtasks = getSubtasks(id)

  const handleDecompose = async () => {
    if (!task) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          subject: subject?.name || '未分类',
          totalMinutes: task.estimatedMinutes,
          deadline: task.deadline || new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI 拆解失败')
      setSuggestions(data.suggestions)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI 拆解失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!task || suggestions.length === 0) return
    try {
      await addSubtasks(task.id, suggestions, task.subjectId)
      toast.success(locale === 'zh-CN' ? `已生成 ${suggestions.length} 个子任务` : `Generated ${suggestions.length} subtasks`)
      router.push(`/tasks/${id}`)
    } catch {
      toast.error(locale === 'zh-CN' ? '保存子任务失败' : 'Failed to save subtasks')
    }
  }

  const handleRemoveSubtask = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingSubtask = async (subtaskId: string) => {
    await deleteTask(subtaskId)
    toast.success(locale === 'zh-CN' ? '子任务已删除' : 'Subtask deleted')
  }

  const totalSuggestedMinutes = suggestions.reduce((sum, s) => sum + s.estimatedMinutes, 0)

  if (!task) {
    return (
      <EmptyState
        title={locale === 'zh-CN' ? '任务不存在' : 'Task not found'}
        description={locale === 'zh-CN' ? '该任务可能已被删除' : 'This task may have been deleted'}
        action={
          <button onClick={() => router.push('/tasks')} className="text-sm text-primary">
            {locale === 'zh-CN' ? '返回任务列表' : 'Back to task list'}
          </button>
        }
      />
    )
  }

  return (
    <div className="pb-4 animate-fade-in">
      <PageHeader title={t.tasks.aiDecompose} backHref={`/tasks/${id}`} />

      <Card className="mb-4">
        <h3 className="text-sm font-semibold mb-2">{locale === 'zh-CN' ? '任务信息' : 'Task Info'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">{t.tasks.taskTitle}</span>
            <span className="font-medium">{task.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">{t.tasks.subject}</span>
            <span>{subject?.name || (locale === 'zh-CN' ? '未分类' : 'Uncategorized')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">{t.tasks.estimatedTime}</span>
            <span>{getTimeStr(task.estimatedMinutes, t.tasks.minutes)}</span>
          </div>
          {task.deadline && (
            <div className="flex justify-between">
              <span className="text-text-muted">{t.tasks.deadline}</span>
              <span>{new Date(task.deadline).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="mb-4">
        <button
          onClick={handleDecompose}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {locale === 'zh-CN' ? 'AI 正在分析中...' : 'AI is analyzing...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {suggestions.length > 0
                ? (locale === 'zh-CN' ? '重新拆解' : 'Re-decompose')
                : (locale === 'zh-CN' ? '开始 AI 拆解' : 'Start AI Decompose')}
            </>
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              {locale === 'zh-CN' ? 'AI 建议的子任务' : 'AI Suggested Subtasks'} ({suggestions.length})
            </h3>
            <span className="text-xs text-text-muted">
              {locale === 'zh-CN' ? '合计' : 'Total'} {getTimeStr(totalSuggestedMinutes, t.tasks.minutes)}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {suggestions.map((s, i) => (
              <Card key={i} className="relative pr-12 animate-scale-in">
                <button
                  onClick={() => handleRemoveSubtask(i)}
                  className="absolute top-3 right-3 p-1 text-text-muted hover:text-danger transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-medium pr-4">{s.subtaskTitle}</h4>
                <p className="text-xs text-text-muted mt-1">{s.strategy}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {getTimeStr(s.estimatedMinutes, t.tasks.minutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {s.suggestedPomodoros} {locale === 'zh-CN' ? '个番茄钟' : 'pomodoros'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-success text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Check className="w-5 h-5" />
            {locale === 'zh-CN' ? '确认并生成子任务' : 'Confirm & Generate Subtasks'}
          </button>
        </div>
      )}

      {existingSubtasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">{locale === 'zh-CN' ? '已有子任务' : 'Existing Subtasks'}</h3>
          <div className="space-y-2">
            {existingSubtasks.map(st => (
              <Card key={st.id} className="flex items-center gap-3">
                <span
                  className={st.status === 'completed' ? 'text-success' : 'text-text-muted'}
                >
                  <Check className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${st.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                    {st.title}
                  </p>
                  <p className="text-xs text-text-muted">{getTimeStr(st.estimatedMinutes, t.tasks.minutes)}</p>
                </div>
                <button
                  onClick={() => handleRemoveExistingSubtask(st.id)}
                  className="p-1 text-text-muted hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
