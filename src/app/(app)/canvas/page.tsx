'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Layout, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/format'
import type { Canvas } from '@/types'

export default function CanvasListPage() {
  const [creating, setCreating] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: canvases = [], isLoading } = useQuery<Canvas[]>({
    queryKey: ['canvases'],
    queryFn: async () => {
      const res = await fetch('/api/canvas')
      return res.json()
    },
  })

  async function createCanvas() {
    setCreating(true)
    try {
      const res = await fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Canvas' }),
      })
      const canvas = await res.json()
      queryClient.invalidateQueries({ queryKey: ['canvases'] })
      router.push(`/canvas/${canvas.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Canvas</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Visual whiteboards for your ideas</p>
        </div>
        <Button onClick={createCanvas} loading={creating} className="gap-2">
          <Plus className="h-4 w-4" /> New canvas
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : !canvases.length ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="h-14 w-14 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-3">
              <Layout className="h-6 w-6 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">No canvases yet</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Create a visual whiteboard to organize your thoughts</p>
            <Button onClick={createCanvas} size="sm" className="mt-4 gap-2">
              <Plus className="h-3.5 w-3.5" /> Create canvas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {canvases.map((canvas, i) => (
              <motion.div
                key={canvas.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/canvas/${canvas.id}`}>
                  <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] overflow-hidden cursor-pointer hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5">
                    {/* Preview area */}
                    <div className="h-36 bg-[var(--color-bg-secondary)] flex items-center justify-center relative">
                      {canvas.thumbnail_url ? (
                        <img src={canvas.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Layout className="h-10 w-10 text-[var(--color-text-tertiary)]" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Pencil className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{canvas.title}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{formatDate(canvas.updated_at)}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
