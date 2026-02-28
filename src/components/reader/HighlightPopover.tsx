'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter, X, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { HighlightColor } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

const COLORS: { id: HighlightColor; bg: string; mark: string }[] = [
  { id: 'yellow', bg: 'bg-[var(--color-hl-yellow)]', mark: '#FCD34D' },
  { id: 'green', bg: 'bg-[var(--color-hl-green)]', mark: '#6EE7B7' },
  { id: 'blue', bg: 'bg-[var(--color-hl-blue)]', mark: '#93C5FD' },
  { id: 'pink', bg: 'bg-[var(--color-hl-pink)]', mark: '#F9A8D4' },
  { id: 'orange', bg: 'bg-[var(--color-hl-orange)]', mark: '#FCA5A5' },
  { id: 'purple', bg: 'bg-[var(--color-hl-purple)]', mark: '#C4B5FD' },
]

interface HighlightPopoverProps {
  documentId: string
  onHighlightCreated?: (highlight: { id: string; text: string; color: HighlightColor }) => void
}

interface PopoverPosition {
  x: number
  y: number
  text: string
  range: Range
}

export function HighlightPopover({ documentId, onHighlightCreated }: HighlightPopoverProps) {
  const [popover, setPopover] = useState<PopoverPosition | null>(null)
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      // Don't show if clicking inside the popover
      if (popoverRef.current?.contains(e.target as Node)) return

      setTimeout(() => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setPopover(null)
          return
        }

        const text = selection.toString().trim()
        if (text.length < 5) return

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setPopover({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 12,
          text,
          range,
        })
      }, 10)
    }

    function handleMouseDown(e: MouseEvent) {
      if (!popoverRef.current?.contains(e.target as Node)) {
        setPopover(null)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  async function saveHighlight() {
    if (!popover) return
    setSaving(true)

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          text: popover.text,
          color: selectedColor,
          location_data: {},
        }),
      })
      const data = await res.json()

      if (res.ok) {
        onHighlightCreated?.({ id: data.id, text: popover.text, color: selectedColor })
        queryClient.invalidateQueries({ queryKey: ['highlights', documentId] })
        window.getSelection()?.removeAllRanges()
        setPopover(null)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!popover) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'absolute',
          left: popover.x,
          top: popover.y,
          transform: 'translate(-50%, -100%)',
          zIndex: 50,
        }}
        className="glass rounded-xl shadow-2xl px-2 py-2 flex items-center gap-1.5"
      >
        <Highlighter className="h-3.5 w-3.5 text-[var(--color-text-secondary)] mr-0.5" />

        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedColor(c.id)}
            className={cn(
              'h-5 w-5 rounded-full transition-transform',
              c.bg,
              selectedColor === c.id && 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110'
            )}
          />
        ))}

        <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

        <button
          onClick={saveHighlight}
          disabled={saving}
          className="h-6 px-2 rounded-md bg-[var(--color-accent)] text-white text-xs font-medium flex items-center gap-1 hover:bg-[var(--color-accent-600)] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Save
        </button>

        <button
          onClick={() => { window.getSelection()?.removeAllRanges(); setPopover(null) }}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)]"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
