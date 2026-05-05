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
import { decomposeTaskWithAI } from '@/lib/ai'
import { getTimeString } from '@/lib/utils'
import type { AITaskSuggestion } from '@/types'

export default function DecomposePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { tasks, addSubtasks, getSubtasks, deleteTask } = useTaskStore()
  const { subjects } = useSubjectStore()
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([])
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cf_api_key') || ''
    }
    return ''
  })
  const [accountId, setAccountId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cf_account_id') || ''
    }
    return ''
  })
  const [showConfig, setShowConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('cf_api_key')
      const id = localStorage.getItem('cf_account_id')
      return !key || !id
    }
    return true
  })

  const task = tasks.find(t => t.id === id)
  const subject = subjects.find(s => s.id === task?.subjectId)
  const existingSubtasks = getSubtasks(id)

  const handleDecompose = async () => {
    if (!task) return
    if (!apiKey || !accountId) {
      setShowConfig(true)
      toast.error('请先配置 Cloudflare API 密钥')
      return
    }

    setLoading(true)
    try {
      localStorage.setItem('cf_api_key', apiKey)
      localStorage.setItem('cf_account_id', accountId)

      const results = await decomposeTaskWithAI(
        task.title,
        subject?.name || '未分类',
        task.estimatedMinutes,
        task.deadline || new Date().toISOString(),
        apiKey,
        accountId
      )
      setSuggestions(results)
    } catch {
      toast.error('AI 拆解失败，请检查 API 配置')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!task || suggestions.length === 0) return
    try {
      await addSubtasks(task.id, suggestions, task.subjectId)
      toast.success(`已生成 ${suggestions.length} 个子任务`)
      router.push(`/tasks/${id}`)
    } catch {
      toast.error('保存子任务失败')
    }
  }

  const handleRemoveSubtask = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingSubtask = async (subtaskId: string) => {
    await deleteTask(subtaskId)
    toast.success('子任务已删除')
  }

  const totalSuggestedMinutes = suggestions.reduce((sum, s) => sum + s.estimatedMinutes, 0)

  if (!task) {
    return (
      <EmptyState
        title="任务不存在"
        description="该任务可能已被删除"
        action={
          <button onClick={() => router.push('/tasks')} className="text-sm text-primary">
            返回任务列表
          </button>
        }
      />
    )
  }

  return (
    <div className="pb-4">
      <PageHeader title="AI 智能拆解" backHref={`/tasks/${id}`} />

      {showConfig && (
        <Card className="mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            Cloudflare Workers AI 配置
          </h3>
          <p className="text-xs text-text-muted mb-3">
            请填入你的 Cloudflare Account ID 和 API Token（需要有 Workers AI 权限）
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="Account ID"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="API Token"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
            <button
              onClick={() => {
                localStorage.setItem('cf_api_key', apiKey)
                localStorage.setItem('cf_account_id', accountId)
                setShowConfig(false)
                toast.success('配置已保存')
              }}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              保存配置
            </button>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <h3 className="text-sm font-semibold mb-2">任务信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">标题</span>
            <span className="font-medium">{task.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">科目</span>
            <span>{subject?.name || '未分类'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">预估时间</span>
            <span>{getTimeString(task.estimatedMinutes)}</span>
          </div>
          {task.deadline && (
            <div className="flex justify-between">
              <span className="text-text-muted">截止日期</span>
              <span>{new Date(task.deadline).toLocaleDateString('zh-CN')}</span>
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
              AI 正在分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {suggestions.length > 0 ? '重新拆解' : '开始 AI 拆解'}
            </>
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              AI 建议的子任务 ({suggestions.length})
            </h3>
            <span className="text-xs text-text-muted">
              合计 {getTimeString(totalSuggestedMinutes)}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {suggestions.map((s, i) => (
              <Card key={i} className="relative pr-12">
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
                    <Clock className="w-3 h-3" /> {getTimeString(s.estimatedMinutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {s.suggestedPomodoros} 个番茄钟
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
            确认并生成子任务
          </button>
        </div>
      )}

      {existingSubtasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">已有子任务</h3>
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
                  <p className="text-xs text-text-muted">{getTimeString(st.estimatedMinutes)}</p>
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
