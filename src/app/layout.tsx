import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { BottomNav } from '@/components/layout/BottomNav'
import { AppInitializer } from '@/components/layout/AppInitializer'
import './globals.css'

export const metadata: Metadata = {
  title: '智习助手 - AI学习规划',
  description: '智能学习计划生成器，番茄钟计时，艾宾浩斯复习提醒',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '智习助手',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen pb-20">
        <AppInitializer />
        <main className="max-w-3xl mx-auto px-4 pt-4">
          {children}
        </main>
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
