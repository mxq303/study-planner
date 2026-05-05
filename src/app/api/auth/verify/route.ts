import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const verificationStore = new Map<string, { code: string; email: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000

    verificationStore.set(email, { code, email, expires })

    console.log(`[DEV] Verification code for ${email}: ${code}`)

    return NextResponse.json({ success: true, message: '验证码已发送', code })
  } catch {
    return NextResponse.json({ error: '发送失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const record = verificationStore.get(email)
    if (!record) return NextResponse.json({ error: '请先发送验证码' }, { status: 400 })
    if (Date.now() > record.expires) {
      verificationStore.delete(email)
      return NextResponse.json({ error: '验证码已过期' }, { status: 400 })
    }
    if (record.code !== code) return NextResponse.json({ error: '验证码错误' }, { status: 400 })

    verificationStore.delete(email)

    if (prisma) {
      await prisma.user.update({
        where: { email },
        data: { updatedAt: new Date() } as Record<string, unknown>,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '验证失败' }, { status: 500 })
  }
}
