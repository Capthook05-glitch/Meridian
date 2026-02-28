'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, FileText, Highlighter, BookOpen, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import type { SearchResult } from '@/types'

const TYPE_ICONS = {
  document: FileText,
  highlight: Highlighter,
  note: BookOpen,
}

const TYPE_COLORS = {
  document: 'text-[var(--color-accent-300)]',
  highlight: 'text-[var(--color-warning)]',
  note: 'text-[var(--color-success)]',
}

const TYPE_HREFS = (r: SearchResult) => ({
  document: `/library/${r.id}`,
  highlight: `/library`,
  note: `/notes/${r.id}`,
})[r.type]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)

  const { data, isFetching } = useQuery<{ results: SearchResult[]; query: string }>({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [], query: '' }
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&mode=hybrid`)
      return res.json()
    },
    enabled: debouncedQuery.length > 1,
  })

  const results = data?.results ?? []

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Search</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Semantic + full-text search across your knowledge</p>
      </div>

      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <div className="relative max-w-2xl">
          {isFetching
            ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--color-text-tertiary)]" />
            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />}
          <Input
            placeholder="Search your knowledge base…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
            autoFocus
          />
          {query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Zap className="h-3 w-3 text-[var(--color-accent-300)]" />
              <span className="text-xs text-[var(--color-text-tertiary)]">semantic</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!query ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Search className="h-10 w-10 text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text)]">Search across everything</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Articles, highlights, notes — searched by meaning, not just keywords
            </p>
          </div>
        ) : (
          <div className="max-w-2xl">
            {results.length === 0 && !isFetching && debouncedQuery ? (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--color-text-secondary)]">No results for &quot;{debouncedQuery}&quot;</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Try different keywords or a broader search</p>
              </div>
            ) : (
              <div>
                {results.length > 0 && (
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                    {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
                  </p>
                )}
                <AnimatePresence>
                  <div className="space-y-2">
                    {results.map((result, i) => {
                      const Icon = TYPE_ICONS[result.type]
                      const href = TYPE_HREFS(result)
                      const color = TYPE_COLORS[result.type]
                      const similarity = Math.round(result.similarity * 100)

                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <Link href={href}>
                            <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-all cursor-pointer">
                              <div className={`mt-0.5 ${color} shrink-0`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{result.title}</p>
                                  <Badge variant={result.type === 'document' ? 'default' : result.type === 'note' ? 'success' : 'warning'} className="text-[10px] shrink-0">
                                    {result.type}
                                  </Badge>
                                </div>
                                {result.excerpt && (
                                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                                    {result.excerpt}
                                  </p>
                                )}
                              </div>
                              <div className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                                {similarity}%
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
