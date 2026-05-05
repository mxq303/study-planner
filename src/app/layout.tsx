import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/layout/Providers'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppInitializer } from '@/components/layout/AppInitializer'
import './globals.css'

export const metadata: Metadata = {
  title: '智习助手 - AI学习规划 | Study Planner',
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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <AppInitializer />
          <Sidebar />
          <div className="md:pl-64">
            <main className="max-w-5xl mx-auto px-4 pt-4 md:px-8 md:pt-6 pb-20 md:pb-8">
              {children}
            </main>
          </div>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
