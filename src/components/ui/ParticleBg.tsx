'use client'

import { motion } from 'framer-motion'

export function ParticleBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
        animate={{
          x: [0, -20, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}
