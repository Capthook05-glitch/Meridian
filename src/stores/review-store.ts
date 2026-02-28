import { create } from 'zustand'
import type { Highlight } from '@/types'

interface ReviewState {
  sessionId: string | null
  cards: Highlight[]
  currentIndex: number
  isFlipped: boolean
  sessionComplete: boolean
  stats: { correct: number; total: number }
  setSession: (sessionId: string, cards: Highlight[]) => void
  flipCard: () => void
  nextCard: () => void
  recordResult: (quality: number) => void
  resetSession: () => void
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  sessionId: null,
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  sessionComplete: false,
  stats: { correct: 0, total: 0 },

  setSession: (sessionId, cards) =>
    set({ sessionId, cards, currentIndex: 0, isFlipped: false, sessionComplete: false, stats: { correct: 0, total: 0 } }),

  flipCard: () => set((s) => ({ isFlipped: !s.isFlipped })),

  nextCard: () =>
    set((s) => {
      const next = s.currentIndex + 1
      if (next >= s.cards.length) return { sessionComplete: true, isFlipped: false }
      return { currentIndex: next, isFlipped: false }
    }),

  recordResult: (quality) =>
    set((s) => ({
      stats: {
        correct: s.stats.correct + (quality >= 3 ? 1 : 0),
        total: s.stats.total + 1,
      },
    })),

  resetSession: () =>
    set({ sessionId: null, cards: [], currentIndex: 0, isFlipped: false, sessionComplete: false, stats: { correct: 0, total: 0 } }),
}))
