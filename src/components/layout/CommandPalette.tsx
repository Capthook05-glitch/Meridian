'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, BookOpen, Layout, Brain, Search, Sparkles,
  Settings, Plus, FileText, Hash, ArrowRight
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils/cn'

const pages = [
  { id: 'library', label: 'Library', icon: Library, href: '/library' },
  { id: 'notes', label: 'Notes', icon: BookOpen, href: '/notes' },
  { id: 'canvas', label: 'Canvas', icon: Layout, href: '/canvas' },
  { id: 'review', label: 'Review', icon: Brain, href: '/review' },
  { id: 'search', label: 'Search', icon: Search, href: '/search' },
  { id: 'ai', label: 'AI Chat', icon: Sparkles, href: '/ai' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setSaveURLDialogOpen } = useAppStore()
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const runCommand = useCallback((fn: () => void) => {
    setCommandPaletteOpen(false)
    setQuery('')
    fn()
  }, [setCommandPaletteOpen])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-[560px] -translate-x-1/2"
          >
            <Command
              className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
              shouldFilter={true}
            >
              <div className="flex items-center border-b border-[var(--color-border)] px-4">
                <Search className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] mr-3" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search or jump to..."
                  className="flex-1 bg-transparent py-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                />
                <kbd className="text-[var(--color-text-tertiary)] text-xs border border-[var(--color-border)] rounded px-1.5 py-0.5">esc</kbd>
              </div>

              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
                  {pages.map((page) => (
                    <Command.Item
                      key={page.id}
                      value={page.label}
                      onSelect={() => runCommand(() => router.push(page.href))}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer',
                        'text-[var(--color-text-secondary)] aria-selected:bg-[var(--color-bg-hover)] aria-selected:text-[var(--color-text)]',
                        'transition-colors'
                      )}
                    >
                      <page.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{page.label}</span>
                      <ArrowRight className="h-3 w-3 text-[var(--color-text-tertiary)] opacity-0 aria-selected:opacity-100" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-[var(--color-border)]" />

                <Command.Group heading="Actions">
                  <Command.Item
                    value="Add to library Save URL"
                    onSelect={() => runCommand(() => setSaveURLDialogOpen(true))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer text-[var(--color-text-secondary)] aria-selected:bg-[var(--color-bg-hover)] aria-selected:text-[var(--color-text)] transition-colors"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    Add to library
                  </Command.Item>
                  <Command.Item
                    value="New note Create note"
                    onSelect={() => runCommand(async () => {
                      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Untitled' }) })
                      const data = await res.json()
                      if (data.id) router.push(`/notes/${data.id}`)
                    })}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer text-[var(--color-text-secondary)] aria-selected:bg-[var(--color-bg-hover)] aria-selected:text-[var(--color-text)] transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    New note
                  </Command.Item>
                  <Command.Item
                    value="New canvas Create canvas"
                    onSelect={() => runCommand(async () => {
                      const res = await fetch('/api/canvas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Untitled Canvas' }) })
                      const data = await res.json()
                      if (data.id) router.push(`/canvas/${data.id}`)
                    })}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer text-[var(--color-text-secondary)] aria-selected:bg-[var(--color-bg-hover)] aria-selected:text-[var(--color-text)] transition-colors"
                  >
                    <Layout className="h-4 w-4 shrink-0" />
                    New canvas
                  </Command.Item>
                  <Command.Item
                    value="Semantic search"
                    onSelect={() => runCommand(() => router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`))}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer text-[var(--color-text-secondary)] aria-selected:bg-[var(--color-bg-hover)] aria-selected:text-[var(--color-text)] transition-colors"
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    Search across your knowledge base
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  <kbd className="border border-[var(--color-border)] rounded px-1">↑↓</kbd> navigate
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  <kbd className="border border-[var(--color-border)] rounded px-1">↵</kbd> select
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  <kbd className="border border-[var(--color-border)] rounded px-1">esc</kbd> close
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
