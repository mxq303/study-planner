'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { Info, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

export function AboutSection() {
  const { t, locale } = useI18n()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text">{t.settings.about}</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">{t.settings.version}</span>
          <span className="font-medium text-text">1.0.0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">{t.settings.techStack}</span>
          <span className="font-medium text-text">Next.js 16 + Tailwind v4</span>
        </div>
        <Link
          href="#feedback"
          onClick={e => { e.preventDefault(); toast.info(locale === 'zh-CN' ? '反馈功能即将上线' : 'Feedback coming soon') }}
          className="flex items-center gap-1 text-primary text-sm mt-2"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {t.settings.feedback}
        </Link>
      </div>
    </div>
  )
}
