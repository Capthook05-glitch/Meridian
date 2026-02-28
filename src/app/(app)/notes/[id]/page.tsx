'use client'

import { use, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Link2, MoreHorizontal, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { BacklinksPanel } from '@/components/editor/BacklinksPanel'
import type { Note } from '@/types'

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [backlinksOpen, setBacklinksOpen] = useState(true)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: note, isLoading } = useQuery<Note>({
    queryKey: ['note', id],
    queryFn: async () => {
      const res = await fetch(`/api/notes/${id}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
  })

  const handleSave = useCallback(async (updates: { title: string; content: object; content_text: string }) => {
    setSaving(true)
    try {
      await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      queryClient.invalidateQueries({ queryKey: ['note', id] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }, [id, queryClient])

  async function updateTitle(title: string) {
    if (!note) return
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    queryClient.invalidateQueries({ queryKey: ['note', id] })
    queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  async function deleteNote() {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    queryClient.invalidateQueries({ queryKey: ['notes'] })
    router.push('/notes')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-[var(--color-text-secondary)]">Note not found</p>
        <Link href="/notes"><Button variant="ghost" size="sm">Back to notes</Button></Link>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <Link href="/notes">
            <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
            {saving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Save className="h-3 w-3 text-[var(--color-success)]" /><span className="text-[var(--color-success)]">Saved</span></>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setBacklinksOpen(!backlinksOpen)}
            className={backlinksOpen ? 'text-[var(--color-accent-300)]' : ''}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={deleteNote} className="text-[var(--color-danger)]">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable editor */}
        <div className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl w-full mx-auto">
          {/* Editable title */}
          <div
            className="text-3xl font-bold text-[var(--color-text)] mb-4 outline-none empty:before:content-['Untitled'] empty:before:text-[var(--color-text-tertiary)]"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const title = e.currentTarget.textContent?.trim() || 'Untitled'
              if (title !== note.title) updateTitle(title)
            }}
            dangerouslySetInnerHTML={{ __html: note.title }}
          />

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {note.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <NoteEditor note={note} onSave={handleSave} />
        </div>
      </div>

      {/* Backlinks panel */}
      {backlinksOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 border-l border-[var(--color-border)] overflow-hidden overflow-y-auto"
        >
          <BacklinksPanel noteId={id} />
        </motion.div>
      )}
    </div>
  )
}
