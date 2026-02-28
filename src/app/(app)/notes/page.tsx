'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, FileText, Loader2, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils/format'
import type { Note } from '@/types'

export default function NotesPage() {
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes')
      return res.json()
    },
  })

  const filtered = notes.filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase())
  )

  const pinned = filtered.filter((n) => n.is_pinned)
  const unpinned = filtered.filter((n) => !n.is_pinned)

  async function createNote() {
    setCreating(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled' }),
      })
      const note = await res.json()
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      router.push(`/notes/${note.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Notes</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={createNote} loading={creating} className="gap-2">
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-[var(--color-border)]">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <Input
            placeholder="Filter notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="h-14 w-14 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {search ? 'No matching notes' : 'No notes yet'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {search ? 'Try a different search' : 'Create your first note to get started'}
            </p>
            {!search && (
              <Button onClick={createNote} size="sm" className="mt-4 gap-2">
                <Plus className="h-3.5 w-3.5" /> Create note
              </Button>
            )}
          </div>
        ) : (
          <div>
            {pinned.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Pinned</span>
                </div>
                <NoteList notes={pinned} />
              </div>
            )}
            <NoteList notes={unpinned} />
          </div>
        )}
      </div>
    </div>
  )
}

function NoteList({ notes }: { notes: Note[] }) {
  return (
    <AnimatePresence>
      <div className="space-y-1">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Link
              href={`/notes/${note.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group"
            >
              <span className="text-base">{note.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{note.title}</p>
                {note.content_text && (
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                    {note.content_text.slice(0, 80)}
                  </p>
                )}
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatDate(note.updated_at)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}
