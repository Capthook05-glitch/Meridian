import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReaderState {
  fontSize: number
  lineHeight: number
  maxWidth: number
  fontFamily: 'serif' | 'sans'
  setFontSize: (v: number) => void
  setLineHeight: (v: number) => void
  setMaxWidth: (v: number) => void
  setFontFamily: (v: 'serif' | 'sans') => void
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      fontSize: 18,
      lineHeight: 1.85,
      maxWidth: 72,
      fontFamily: 'serif',
      setFontSize: (v) => set({ fontSize: v }),
      setLineHeight: (v) => set({ lineHeight: v }),
      setMaxWidth: (v) => set({ maxWidth: v }),
      setFontFamily: (v) => set({ fontFamily: v }),
    }),
    { name: 'meridian-reader' }
  )
)
