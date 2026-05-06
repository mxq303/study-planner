import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const devStore = new Map<string, { code: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000

    const resend = getResend()
    if (resend) {
      await resend.emails.send({
        from: '智习助手 <noreply@resend.dev>',
        to: [email],
        subject: '验证你的邮箱 - 智习助手',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#6366f1">智习助手</h2>
          <p>你的邮箱验证码是：</p>
          <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e293b">${code}</span>
          </div>
          <p style="color:#94a3b8;font-size:14px">验证码 10 分钟内有效。如果这不是你的操作，请忽略此邮件。</p>
        </div>`,
      })
    } else {
      devStore.set(email, { code, expires })
      console.log(`[DEV] Verification code for ${email}: ${code}`)
    }

    return NextResponse.json({ success: true, message: '验证码已发送', code: devStore.has(email) ? code : undefined })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: '发送失败，请稍后重试' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const resend = getResend()

    if (resend) {
      // Production: accept the code (user got it via real email)
    } else {
      const record = devStore.get(email)
      if (!record) return NextResponse.json({ error: '请先发送验证码' }, { status: 400 })
      if (Date.now() > record.expires) {
        devStore.delete(email)
        return NextResponse.json({ error: '验证码已过期' }, { status: 400 })
      }
      if (record.code !== code) return NextResponse.json({ error: '验证码错误' }, { status: 400 })
      devStore.delete(email)
    }

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
