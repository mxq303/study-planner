'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Cloud } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
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
          <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">云端同步</h2>
          <p className="text-sm text-text-muted mb-6">
            登录后，您的学习数据将自动同步到云端，支持跨设备访问。
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
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
              placeholder="密码"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
            >
              登录
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4">
            功能开发中，敬请期待
          </p>
        </Card>
      </div>
    </div>
  )
}
