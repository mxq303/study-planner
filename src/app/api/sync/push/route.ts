import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: '登录已过期' }, { status: 401 })

  const userId = payload.userId

  if (!prisma) {
    return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { subjects, tasks, pomodoroSessions, reviewReminders, preferences } = body

    if (subjects?.length) {
      for (const s of subjects) {
        await prisma.subject.upsert({
          where: { id: s.id },
          create: { ...s, userId },
          update: { ...s, userId },
        })
      }
    }

    if (tasks?.length) {
      for (const t of tasks) {
        await prisma.task.upsert({
          where: { id: t.id },
          create: { ...t, userId },
          update: { ...t, userId },
        })
      }
    }

    if (pomodoroSessions?.length) {
      for (const s of pomodoroSessions) {
        await prisma.pomodoroSession.upsert({
          where: { id: s.id },
          create: { ...s, userId },
          update: { ...s, userId },
        })
      }
    }

    if (reviewReminders?.length) {
      for (const r of reviewReminders) {
        await prisma.reviewReminder.upsert({
          where: { id: r.id },
          create: { ...r, userId },
          update: { ...r, userId },
        })
      }
    }

    if (preferences) {
      await prisma.userPreference.upsert({
        where: { userId },
        create: { ...preferences, userId },
        update: { ...preferences },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sync push error:', error)
    return NextResponse.json({ error: '同步失败' }, { status: 500 })
  }
}
