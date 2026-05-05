import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: '登录已过期' }, { status: 401 })

  const userId = payload.userId

  if (!prisma) {
    return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  }

  try {
    const [subjects, tasks, pomodoroSessions, reviewReminders, preferences] = await Promise.all([
      prisma.subject.findMany({ where: { userId } }),
      prisma.task.findMany({ where: { userId } }),
      prisma.pomodoroSession.findMany({ where: { userId } }),
      prisma.reviewReminder.findMany({ where: { userId } }),
      prisma.userPreference.findUnique({ where: { userId } }),
    ])

    return NextResponse.json({
      subjects,
      tasks,
      pomodoroSessions,
      reviewReminders,
      preferences,
    })
  } catch (error) {
    console.error('Sync pull error:', error)
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
  }
}
