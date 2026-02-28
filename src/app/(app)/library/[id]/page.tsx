'use client'

import { use, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Archive, Globe, Clock, User,
  Sparkles, ChevronRight, Loader2, BookOpen, Trash2, MessageSquare, Check, X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HighlightPopover } from '@/components/reader/HighlightPopover'
import { useReaderStore } from '@/stores/reader-store'
import { formatDate, formatReadTime } from '@/lib/utils/format'
import type { Document, Highlight, HighlightColor } from '@/types'
import { cn } from '@/lib/utils/cn'

const HL_COLORS: Record<string, string> = {
  yellow: 'rgba(252,211,77,0.35)',
  green: 'rgba(110,231,183,0.35)',
  blue: 'rgba(147,197,253,0.35)',
  pink: 'rgba(249,168,212,0.35)',
  orange: 'rgba(252,165,165,0.35)',
  purple: 'rgba(196,181,253,0.35)',
}

const HL_BORDER: Record<string, string> = {
  yellow: '#FCD34D',
  green: '#6EE7B7',
  blue: '#93C5FD',
  pink: '#F9A8D4',
  orange: '#FCA5A5',
  purple: '#C4B5FD',
}

// Inject highlight marks into raw HTML string
function injectHighlights(html: string, highlights: Highlight[]): string {
  if (!highlights.length || !html) return html
  // Sort longest first to avoid partial overlaps replacing shorter text first
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length)
  let result = html
  for (const h of sorted) {
    // Escape regex special chars
    const escaped = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const color = HL_COLORS[h.color] || HL_COLORS.yellow
    const border = HL_BORDER[h.color] || HL_BORDER.yellow
    const mark = `<mark data-hl-id="${h.id}" style="background:${color};border-bottom:2px solid ${border};border-radius:2px;padding:0 1px;cursor:pointer;">${h.text}</mark>`
    try {
      result = result.replace(new RegExp(escaped, 'g'), mark)
    } catch {
      // Skip if regex is invalid
    }
  }
  return result
}

function HighlightCard({
  highlight,
  documentId,
  onUpdated,
  onDeleted,
}: {
  highlight: Highlight
  documentId: string
  onUpdated: () => void
  onDeleted: () => void
}) {
  const [editingNote, setEditingNote] = useState(false)
  const [note, setNote] = useState(highlight.note || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingNote) textareaRef.current?.focus()
  }, [editingNote])

  async function saveNote() {
    if (note === (highlight.note || '')) { setEditingNote(false); return }
    setSaving(true)
    await fetch(`/api/highlights/${highlight.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note || null }),
    })
    setSaving(false)
    setEditingNote(false)
    onUpdated()
  }

  async function deleteHighlight() {
    setDeleting(true)
    await fetch(`/api/highlights/${highlight.id}`, { method: 'DELETE' })
    onDeleted()
  }

  return (
    <div
      className="rounded-lg p-3 text-sm leading-relaxed group relative"
      style={{ background: HL_COLORS[highlight.color] || HL_COLORS.yellow, borderLeft: `3px solid ${HL_BORDER[highlight.color] || HL_BORDER.yellow}` }}
    >
      <p className="text-[var(--color-text)] mb-1">{highlight.text}</p>

      {editingNote ? (
        <div className="mt-2">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote() }}
            placeholder="Add a note…"
            rows={2}
            className="w-full text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded p-2 text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={saveNote}
              disabled={saving}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[var(--color-accent)] text-white"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save
            </button>
            <button
              onClick={() => { setNote(highlight.note || ''); setEditingNote(false) }}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {highlight.note && (
            <p
              onClick={() => setEditingNote(true)}
              className="mt-1 text-xs text-[var(--color-text-secondary)] italic cursor-pointer hover:text-[var(--color-text)]"
            >
              {highlight.note}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingNote(true)}
              className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-hover)]"
            >
              <MessageSquare className="h-3 w-3" />
              {highlight.note ? 'Edit note' : 'Add note'}
            </button>
            <button
              onClick={deleteHighlight}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-hover)] ml-auto"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const { fontSize, lineHeight, fontFamily } = useReaderStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollSaveTimer = useRef<ReturnType<typeof setTimeout>>()

  const { data: doc, isLoading } = useQuery<Document>({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
  })

  const { data: highlights = [] } = useQuery<Highlight[]>({
    queryKey: ['highlights', id],
    queryFn: async () => {
      const res = await fetch(`/api/highlights?document_id=${id}`)
      return res.json()
    },
  })

  // Restore scroll position
  useEffect(() => {
    if (!doc || !scrollRef.current) return
    const saved = localStorage.getItem(`read-pos-${id}`)
    if (saved) {
      scrollRef.current.scrollTop = parseInt(saved, 10)
    }
  }, [doc, id])

  // Save scroll position on scroll (debounced 500ms)
  const handleScroll = useCallback(() => {
    clearTimeout(scrollSaveTimer.current)
    scrollSaveTimer.current = setTimeout(() => {
      if (!scrollRef.current) return
      const pos = scrollRef.current.scrollTop
      localStorage.setItem(`read-pos-${id}`, String(pos))
      // Save reading progress to DB
      const progress = scrollRef.current.scrollTop /
        Math.max(1, scrollRef.current.scrollHeight - scrollRef.current.clientHeight)
      fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reading_progress: Math.min(1, progress) }),
      }).catch(() => {})
    }, 500)
  }, [id])

  // Inject highlights into content HTML
  const contentWithHighlights = useMemo(
    () => injectHighlights(doc?.content_html || '', highlights),
    [doc?.content_html, highlights]
  )

  async function toggleFavorite() {
    if (!doc) return
    await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !doc.is_favorite }),
    })
    queryClient.invalidateQueries({ queryKey: ['document', id] })
    queryClient.invalidateQueries({ queryKey: ['documents'] })
  }

  async function generateSummary() {
    if (!doc?.content_text || doc.ai_summary) return
    setSummarizing(true)
    try {
      await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: id, text: doc.content_text }),
      })
      queryClient.invalidateQueries({ queryKey: ['document', id] })
    } finally {
      setSummarizing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <BookOpen className="h-10 w-10 text-[var(--color-text-tertiary)]" />
        <p className="text-[var(--color-text-secondary)]">Article not found</p>
        <Link href="/library"><Button variant="ghost" size="sm">Back to library</Button></Link>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main reader */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--color-border)] px-6 py-3 flex items-center gap-3">
          <Link href="/library">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-[var(--color-text-secondary)] truncate flex-1">{doc.title}</p>
          {doc.reading_progress > 0.05 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
              <div className="w-16 h-1 rounded-full bg-[var(--color-border)]">
                <div
                  className="h-1 rounded-full bg-[var(--color-accent)]"
                  style={{ width: `${Math.round(doc.reading_progress * 100)}%` }}
                />
              </div>
              {Math.round(doc.reading_progress * 100)}%
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={toggleFavorite}>
              <Star className={cn('h-4 w-4', doc.is_favorite && 'fill-[var(--color-warning)] text-[var(--color-warning)]')} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { setSummaryOpen(!summaryOpen); if (!doc.ai_summary) generateSummary() }}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Article */}
        <div className="max-w-3xl mx-auto px-6 py-10 relative">
          {/* Metadata */}
          <div className="mb-8">
            {doc.cover_image_url && (
              <img src={doc.cover_image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-6" />
            )}
            <h1 className="text-3xl font-bold text-[var(--color-text)] leading-tight mb-3">{doc.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              {doc.author && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{doc.author}</span>}
              {doc.domain && (
                <a href={doc.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--color-accent-300)] transition-colors">
                  <Globe className="h-3.5 w-3.5" />{doc.domain}
                </a>
              )}
              {doc.estimated_read_time_minutes && (
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatReadTime(doc.estimated_read_time_minutes)}</span>
              )}
              <span>{formatDate(doc.created_at)}</span>
            </div>
            {doc.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {doc.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
              </div>
            )}
          </div>

          {/* AI Summary panel */}
          {summaryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[var(--color-accent-300)]" />
                <span className="text-sm font-medium text-[var(--color-accent-300)]">AI Summary</span>
              </div>
              {summarizing ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating summary…
                </div>
              ) : doc.ai_summary ? (
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{doc.ai_summary}</p>
                  {doc.ai_key_points && doc.ai_key_points.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {doc.ai_key_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                          <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-[var(--color-accent-300)] shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}

          {highlights.length > 0 && (
            <div className="mb-4 text-xs text-[var(--color-text-tertiary)]">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Article content */}
          <div className="relative">
            <HighlightPopover
              documentId={id}
              onHighlightCreated={() => queryClient.invalidateQueries({ queryKey: ['highlights', id] })}
            />
            <div
              className="reader-content"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontFamily: fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)',
              }}
              dangerouslySetInnerHTML={{ __html: contentWithHighlights }}
            />
          </div>
        </div>
      </div>

      {/* Highlights sidebar */}
      {highlights.length > 0 && (
        <div className="w-72 shrink-0 border-l border-[var(--color-border)] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-3">
              Highlights ({highlights.length})
            </h3>
            <div className="space-y-3">
              {highlights.map((h) => (
                <HighlightCard
                  key={h.id}
                  highlight={h}
                  documentId={id}
                  onUpdated={() => queryClient.invalidateQueries({ queryKey: ['highlights', id] })}
                  onDeleted={() => queryClient.invalidateQueries({ queryKey: ['highlights', id] })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
