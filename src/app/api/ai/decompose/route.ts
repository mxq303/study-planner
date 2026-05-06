import { NextRequest, NextResponse } from 'next/server'
import { decomposeTaskWithAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { title, subject, totalMinutes, deadline } = await request.json()
    if (!title) return NextResponse.json({ error: '任务标题不能为空' }, { status: 400 })

    const suggestions = await decomposeTaskWithAI(title, subject, totalMinutes, deadline)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI decompose error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 拆解失败' },
      { status: 500 }
    )
  }
}
