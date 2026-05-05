'use client'

import { useState } from 'react'
import { Sparkles, CheckSquare, Timer, Rocket, ChevronRight } from 'lucide-react'
import { ParticleBg } from '@/components/ui/ParticleBg'

interface OnboardingWizardProps {
  onComplete: () => void
}

const steps = [
  {
    icon: Sparkles,
    titleKey: 'welcome',
    title: '欢迎来到智习助手',
    desc: '我是你的 AI 学习伙伴，帮你规划每一天的学习任务，用科学方法提升效率。',
  },
  {
    icon: CheckSquare,
    titleKey: 'tasks',
    title: '添加学习任务',
    desc: '创建你的学习任务，设置截止日期和优先级。AI 会自动帮你拆解大任务，生成最优学习计划。',
  },
  {
    icon: Timer,
    titleKey: 'pomodoro',
    title: '番茄钟专注',
    desc: '使用内置番茄钟计时器，配合白噪音保持专注。完成学习后自动记录统计数据。',
  },
  {
    icon: Rocket,
    titleKey: 'ready',
    title: '准备就绪！',
    desc: '你已掌握核心功能。现在去创建第一个任务，开启高效学习之旅吧！',
  },
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('has_seen_onboarding')
  })

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem('has_seen_onboarding', 'true')
      setVisible(false)
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('has_seen_onboarding', 'true')
    setVisible(false)
    onComplete()
  }

  if (!visible) return null

  const s = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="card-bg rounded-3xl w-[90vw] max-w-md p-8 mx-4 animate-scale-in border border-border shadow-xl">
        <div className="flex justify-end mb-4">
          <button onClick={handleSkip} className="text-sm text-text-muted hover:text-text transition-colors">
            跳过
          </button>
        </div>

        <div className="text-center mb-8 relative">
          <ParticleBg />
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 animate-bounce-gentle relative z-10" key={step}>
            <s.icon className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-3 animate-fade-in" key={s.titleKey}>{s.title}</h2>
          <p className="text-sm text-text-muted leading-relaxed animate-slide-up">{s.desc}</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors active:scale-[0.98]"
        >
          {isLast ? '开始使用' : '下一步'}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
