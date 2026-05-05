'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('云端同步功能即将上线，敬请期待')
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Link href="/settings" className="inline-flex items-center text-sm text-text-muted mb-6 hover:text-text">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </Link>
        <Card className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold mb-2">注册账号</h2>
          <p className="text-sm text-text-muted mb-6">
            注册后可在多设备间同步学习数据
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="昵称"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm"
              required
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="邮箱地址"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
            >
              注册
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4">
            已有账号？<Link href="/auth/login" className="text-primary">立即登录</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
