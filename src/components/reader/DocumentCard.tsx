'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Globe, Star, BookOpen, FileText, Video } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatReadTime } from '@/lib/utils/format'
import type { Document } from '@/types'

const typeIcons: Record<string, React.ElementType> = {
  article: FileText,
  pdf: FileText,
  video: Video,
  default: BookOpen,
}

interface DocumentCardProps {
  document: Document
  view?: 'grid' | 'list'
}

export function DocumentCard({ document: doc, view = 'grid' }: DocumentCardProps) {
  const Icon = typeIcons[doc.content_type] || typeIcons.default
  const progress = Math.round(doc.reading_progress)

  if (view === 'list') {
    return (
      <Link href={`/library/${doc.id}`}>
        <motion.div
          whileHover={{ backgroundColor: 'var(--color-bg-hover)' }}
          className="flex items-center gap-4 px-4 py-3 rounded-lg border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
        >
          {/* Cover or icon */}
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
            {doc.cover_image_url ? (
              <img src={doc.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">{doc.title}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {doc.domain && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                  <Globe className="h-3 w-3" />{doc.domain}
                </span>
              )}
              {doc.estimated_read_time_minutes && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                  <Clock className="h-3 w-3" />{formatReadTime(doc.estimated_read_time_minutes)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {doc.is_favorite && <Star className="h-3.5 w-3.5 fill-[var(--color-warning)] text-[var(--color-warning)]" />}
            {progress > 0 && progress < 100 && (
              <div className="text-xs text-[var(--color-text-tertiary)]">{progress}%</div>
            )}
            <span className="text-xs text-[var(--color-text-tertiary)]">{formatDate(doc.created_at)}</span>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/library/${doc.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] overflow-hidden cursor-pointer hover:border-[var(--color-border-strong)] transition-colors"
      >
        {/* Cover image */}
        <div className="relative h-36 bg-[var(--color-bg-elevated)] overflow-hidden">
          {doc.cover_image_url ? (
            <img src={doc.cover_image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-[var(--color-text-tertiary)]" />
            </div>
          )}

          {/* Reading progress */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Favorite star */}
          {doc.is_favorite && (
            <div className="absolute top-2 right-2">
              <Star className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">{doc.title}</p>
            {doc.description && (
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1 leading-relaxed">{doc.description}</p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {doc.domain && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] truncate max-w-[100px]">
                  <Globe className="h-3 w-3 shrink-0" />{doc.domain}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {doc.estimated_read_time_minutes && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                  <Clock className="h-3 w-3" />{formatReadTime(doc.estimated_read_time_minutes)}
                </span>
              )}
            </div>
          </div>

          {doc.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {doc.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5">#{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
