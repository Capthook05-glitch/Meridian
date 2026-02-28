'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Link2, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

interface BacklinksPanelProps {
  noteId: string
}

interface Backlink {
  id: string
  source_note: {
    id: string
    title: string
    icon: string
    updated_at: string
  }
}

export function BacklinksPanel({ noteId }: BacklinksPanelProps) {
  const { data: backlinks = [] } = useQuery<Backlink[]>({
    queryKey: ['backlinks', noteId],
    queryFn: async () => {
      const res = await fetch(`/api/notes/${noteId}/backlinks`)
      return res.json()
    },
  })

  if (backlinks.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Link2 className="h-6 w-6 text-[var(--color-text-tertiary)] mb-2" />
        <p className="text-xs text-[var(--color-text-tertiary)]">No backlinks yet</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
          Link here with [[{'{note title}'}]]
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        <Link2 className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
        <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">
          Backlinks ({backlinks.length})
        </span>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {backlinks.map((bl) => (
          <Link
            key={bl.id}
            href={`/notes/${bl.source_note.id}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <span className="text-base mt-0.5">{bl.source_note.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-text)] truncate">{bl.source_note.title}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {formatDate(bl.source_note.updated_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
