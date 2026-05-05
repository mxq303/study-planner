import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!prisma) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
    }

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: '邮箱和密码不能为空，密码至少6位' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        passwordHash,
        storageMode: 'cloud',
      },
    })

    const token = await createToken(user.id)
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
