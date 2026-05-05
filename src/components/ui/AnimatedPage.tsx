'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
