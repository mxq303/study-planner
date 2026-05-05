'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  className?: string
}

export function StatCard({ icon, label, value, suffix = '', className }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      className={cn('glass-card rounded-2xl p-4', className)}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-text-muted mb-2">{icon}</div>
      <motion.p
        className="text-2xl font-bold text-text"
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {displayValue}{suffix}
      </motion.p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </motion.div>
  )
}
