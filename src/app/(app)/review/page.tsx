'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Zap, Target, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface DueResponse {
  cards: unknown[]
  total_due: number
}

export default function ReviewDashboard() {
  const { data, isLoading } = useQuery<DueResponse>({
    queryKey: ['review-due'],
    queryFn: async () => {
      const res = await fetch('/api/review/due?limit=1')
      return res.json()
    },
    refetchInterval: 60000,
  })

  const dueCount = data?.total_due ?? 0

  const stats = [
    { label: 'Due today', value: dueCount, icon: Zap, color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning)]/10' },
    { label: 'Total highlights', value: '—', icon: Brain, color: 'text-[var(--color-accent-300)]', bg: 'bg-[var(--color-accent)]/10' },
    { label: 'Mastered', value: '—', icon: Target, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success)]/10' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Review</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Spaced repetition for your highlights</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Start session card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-bg-tertiary)] p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mb-3">
                <Brain className="h-6 w-6 text-[var(--color-accent-300)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {isLoading ? '…' : dueCount === 0 ? 'All caught up! 🎉' : `${dueCount} card${dueCount !== 1 ? 's' : ''} due`}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {dueCount === 0
                  ? 'No reviews due. Come back later!'
                  : 'Your highlights are waiting for review'}
              </p>
            </div>
          </div>

          {dueCount > 0 && (
            <Link href="/review/session">
              <Button className="mt-4 gap-2">
                Start review session
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4"
              >
                <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-[var(--color-text)]">
                  {isLoading && stat.value === dueCount ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-accent-300)]" />
            How spaced repetition works
          </h3>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>1. Your highlights are shown as flashcards at optimal intervals.</p>
            <p>2. Rate how well you remembered each one (Again / Hard / Good / Easy).</p>
            <p>3. Cards you know well appear less often; hard ones repeat sooner.</p>
            <p>4. Over time, everything moves to long-term memory naturally.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
