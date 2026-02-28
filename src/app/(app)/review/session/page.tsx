'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Loader2, CheckCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useReviewStore } from '@/stores/review-store'
import type { Highlight } from '@/types'

const QUALITY_BUTTONS = [
  { quality: 1, label: 'Again', color: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' },
  { quality: 3, label: 'Hard', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
  { quality: 4, label: 'Good', color: 'bg-[var(--color-accent)]/10 text-[var(--color-accent-300)] border-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/20' },
  { quality: 5, label: 'Easy', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
]

interface DueResponse { cards: Highlight[]; total_due: number }

export default function ReviewSessionPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<DueResponse>({
    queryKey: ['review-session-cards'],
    queryFn: async () => {
      const res = await fetch('/api/review/due?limit=20')
      return res.json()
    },
  })

  const cards = data?.cards ?? []
  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0

  // Create session on mount
  useEffect(() => {
    async function createSession() {
      if (!data?.cards.length) return
      const res = await fetch('/api/review/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_cards: data.total_due }),
      }).catch(() => null)
      if (res?.ok) {
        const session = await res.json()
        setSessionId(session.id)
      } else {
        setSessionId('local-' + Date.now())
      }
    }
    if (data?.cards.length) createSession()
  }, [data])

  async function submitRating(quality: number) {
    if (!currentCard || !sessionId) return
    setAnswered(true)

    await fetch('/api/review/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highlight_id: currentCard.id, quality, session_id: sessionId }),
    })

    setStats((s) => ({ correct: s.correct + (quality >= 3 ? 1 : 0), total: s.total + 1 }))

    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) {
        setSessionComplete(true)
      } else {
        setCurrentIndex((i) => i + 1)
        setIsFlipped(false)
        setAnswered(false)
      }
    }, 300)
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' && !isFlipped) { e.preventDefault(); setIsFlipped(true) }
      if (isFlipped && !answered) {
        if (e.key === '1') submitRating(1)
        if (e.key === '2') submitRating(3)
        if (e.key === '3') submitRating(4)
        if (e.key === '4') submitRating(5)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isFlipped, answered, currentCard, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <CheckCircle className="h-12 w-12 text-[var(--color-success)]" />
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--color-text)]">Nothing to review!</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">All caught up. Check back later.</p>
        </div>
        <Link href="/review"><Button variant="secondary">Back to dashboard</Button></Link>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 p-6"
      >
        <div className="h-20 w-20 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-[var(--color-success)]" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Session complete!</h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {stats.total} card{stats.total !== 1 ? 's' : ''} reviewed · {accuracy}% accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/review">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Button onClick={() => { setCurrentIndex(0); setIsFlipped(false); setAnswered(false); setSessionComplete(false); setStats({ correct: 0, total: 0 }); queryClient.invalidateQueries({ queryKey: ['review-session-cards'] }) }} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Review again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)]">
        <Link href="/review">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <Progress value={progress} className="h-1.5" />
        </div>
        <span className="text-xs text-[var(--color-text-secondary)] shrink-0">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {currentCard && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
            >
              {/* Source label */}
              {currentCard.document && (
                <p className="text-xs text-[var(--color-text-tertiary)] text-center mb-4">
                  From: {(currentCard.document as { title: string }).title}
                </p>
              )}

              {/* Flip card */}
              <div className={`flip-card h-64 w-full cursor-pointer`} onClick={() => !isFlipped && setIsFlipped(true)}>
                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front */}
                  <div className="flip-card-front rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex flex-col items-center justify-center p-8 text-center">
                    <div
                      className="text-lg leading-relaxed text-[var(--color-text)]"
                      style={{ borderLeft: `4px solid var(--color-hl-${currentCard.color})`, paddingLeft: '1rem', textAlign: 'left' }}
                    >
                      {currentCard.text}
                    </div>
                    {!isFlipped && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-6">
                        Press <kbd className="border border-[var(--color-border)] rounded px-1">Space</kbd> to reveal
                      </p>
                    )}
                  </div>

                  {/* Back */}
                  <div className="flip-card-back rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {currentCard.note || 'How well did you remember this highlight?'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating buttons */}
              <AnimatePresence>
                {isFlipped && !answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-center mt-6"
                  >
                    {QUALITY_BUTTONS.map(({ quality, label, color }, i) => (
                      <motion.button
                        key={quality}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => submitRating(quality)}
                        className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${color}`}
                      >
                        <div>{label}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">[{i + 1}]</div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
