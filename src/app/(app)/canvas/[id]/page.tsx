'use client'

import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Canvas } from '@/types'
import type { TLEditorSnapshot } from 'tldraw'

// Dynamically import tldraw to avoid SSR issues
const CanvasEditor = dynamic(
  () => import('@/components/canvas/CanvasEditor').then((m) => m.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    ),
  }
)

export default function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const { data: canvas, isLoading } = useQuery<Canvas>({
    queryKey: ['canvas', id],
    queryFn: async () => {
      const res = await fetch(`/api/canvas/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setTitle(data.title)
      return data
    },
  })

  async function saveCanvas(snapshot: TLEditorSnapshot) {
    await fetch(`/api/canvas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tldraw_document: snapshot }),
    })
  }

  async function saveTitle() {
    if (!title.trim()) return
    await fetch(`/api/canvas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    queryClient.invalidateQueries({ queryKey: ['canvas', id] })
    queryClient.invalidateQueries({ queryKey: ['canvases'] })
    setEditingTitle(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    )
  }

  if (!canvas) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-[var(--color-text-secondary)]">Canvas not found</p>
        <Link href="/canvas"><Button variant="ghost" size="sm">Back to canvases</Button></Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Minimal toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] z-10">
        <Link href="/canvas">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>

        {editingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
            className="h-7 text-sm max-w-[240px]"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text)] hover:text-[var(--color-text-secondary)] transition-colors group"
          >
            {canvas.title}
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <CanvasEditor canvas={canvas} onSave={saveCanvas} />
      </div>
    </div>
  )
}
