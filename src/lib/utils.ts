import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分钟`
  if (m === 0) return `${h}小时`
  return `${h}小时${m}分钟`
}

export function getMinutesFromTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return map[status] || ''
}

export function getPriorityLabel(priority: number): string {
  const map: Record<number, string> = {
    1: '很低',
    2: '较低',
    3: '普通',
    4: '较高',
    5: '紧急',
  }
  return map[priority] || '普通'
}

export function getPriorityColor(priority: number): string {
  const map: Record<number, string> = {
    1: 'text-gray-400',
    2: 'text-blue-500',
    3: 'text-yellow-500',
    4: 'text-orange-500',
    5: 'text-red-500',
  }
  return map[priority] || 'text-yellow-500'
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '未设置'
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function isToday(dateStr: string): boolean {
  const today = new Date()
  const d = new Date(dateStr)
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(date.getFullYear(), date.getMonth(), diff)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}
