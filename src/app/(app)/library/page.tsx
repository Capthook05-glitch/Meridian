'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LayoutGrid, List, Search, Filter, Loader2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentCard } from '@/components/reader/DocumentCard'
import { useAppStore } from '@/stores/app-store'
import type { Document } from '@/types'

type FilterType = 'all' | 'unread' | 'reading' | 'favorite' | 'archived'

export default function LibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { setSaveURLDialogOpen } = useAppStore()

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['documents', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter === 'archived') params.set('archived', 'true')
      else params.set('archived', 'false')
      if (filter === 'favorite') params.set('favorite', 'true')
      const res = await fetch(`/api/documents?${params}`)
      if (!res.ok) throw new Error('Failed to fetch documents')
      return res.json()
    },
  })

  const filtered = documents?.filter((doc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return doc.title.toLowerCase().includes(q) || doc.description?.toLowerCase().includes(q)
    }
    if (filter === 'unread') return doc.reading_progress === 0
    if (filter === 'reading') return doc.reading_progress > 0 && doc.reading_progress < 100
    return true
  })

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'reading', label: 'In progress' },
    { id: 'favorite', label: 'Favorites' },
    { id: 'archived', label: 'Archived' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Library</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {documents ? `${documents.length} items` : 'Loading…'}
          </p>
        </div>
        <Button onClick={() => setSaveURLDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add article
        </Button>
      </div>

      {/* Filters + search toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <Input
            placeholder="Filter library…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setView('list')}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="h-14 w-14 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {searchQuery ? 'No matching articles' : 'Your library is empty'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {searchQuery ? 'Try a different search term' : 'Save articles and web pages to start reading'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setSaveURLDialogOpen(true)} className="mt-4 gap-2" size="sm">
                <Plus className="h-3.5 w-3.5" /> Add your first article
              </Button>
            )}
          </div>
        ) : view === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
          >
            <AnimatePresence>
              {filtered.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <DocumentCard document={doc} view="grid" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1 max-w-3xl">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} document={doc} view="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
