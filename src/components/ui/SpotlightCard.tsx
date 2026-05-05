'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({ children, className, spotlightColor = 'rgba(99,102,241,0.15)' }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || !spotlightRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`
  }

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent'
    }
  }

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden rounded-2xl card-bg border border-border', className)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 transition-colors duration-500 z-0"
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
