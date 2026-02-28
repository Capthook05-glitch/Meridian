'use client'

import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Archive, Trash2, Globe, Clock, User,
  Sparkles, ChevronRight, Loader2, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HighlightPopover } from '@/components/reader/HighlightPopover'
import { useReaderStore } from '@/stores/reader-store'
import { formatDate, formatReadTime } from '@/lib/utils/format'
import type { Document, Highlight } from '@/types'
import { cn } from '@/lib/utils/cn'

const HL_COLORS: Record<string, string> = {
  yellow: 'rgba(252,211,77,0.3)',
  green: 'rgba(110,231,183,0.3)',
  blue: 'rgba(147,197,253,0.3)',
  pink: 'rgba(249,168,212,0.3)',
  orange: 'rgba(252,165,165,0.3)',
  purple: 'rgba(196,181,253,0.3)',
}

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const { fontSize, lineHeight, fontFamily } = useReaderStore()
  const router = useRouter()
  const queryClient = useQueryClient()

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

  // Inject highlights into HTML
  const contentWithHighlights = doc.content_html || ''

  return (
    <div className="flex h-full">
      {/* Main reader */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--color-border)] px-6 py-3 flex items-center gap-3">
          <Link href="/library">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-[var(--color-text-secondary)] truncate flex-1">{doc.title}</p>
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

          {/* Highlights sidebar count */}
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
                <div
                  key={h.id}
                  className="rounded-lg p-3 text-sm leading-relaxed"
                  style={{ background: HL_COLORS[h.color] || HL_COLORS.yellow }}
                >
                  <p className="text-[var(--color-text)]">{h.text}</p>
                  {h.note && (
                    <p className="mt-2 text-xs text-[var(--color-text-secondary)] italic">{h.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
