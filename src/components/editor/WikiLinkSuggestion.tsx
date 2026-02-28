'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export interface WikiLinkItem {
  id: string
  title: string
  icon?: string
}

interface WikiLinkListProps {
  items: WikiLinkItem[]
  command: (item: WikiLinkItem) => void
}

export const WikiLinkList = forwardRef<{ onKeyDown: (e: KeyboardEvent) => boolean }, WikiLinkListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown({ key }: KeyboardEvent) {
        if (key === 'ArrowUp') {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length)
          return true
        }
        if (key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (key === 'Enter') {
          const item = items[selectedIndex]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    if (!items.length) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="mention-dropdown"
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            className={`mention-item w-full text-left flex items-center gap-2 ${i === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => command(item)}
          >
            <span>{item.icon || '📝'}</span>
            <span className="flex-1 truncate">{item.title}</span>
          </button>
        ))}
      </motion.div>
    )
  }
)
WikiLinkList.displayName = 'WikiLinkList'

// Suggestion config factory — used in NoteEditor
export function buildWikiLinkSuggestion() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reactRenderer: { updateProps: (props?: any) => void; destroy: () => void; element: HTMLElement; ref: any } | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let popup: any[] | null = null

  return {
    char: '[[',
    allowSpaces: true,

    items: async ({ query }: { query: string }): Promise<WikiLinkItem[]> => {
      const res = await fetch(`/api/notes?q=${encodeURIComponent(query)}&limit=8`)
      const notes = await res.json()
      return notes.map((n: { id: string; title: string; icon?: string }) => ({ id: n.id, title: n.title, icon: n.icon }))
    },

    render: () => ({
      onStart(props: unknown) {
        // Dynamic import to avoid SSR issues
        if (typeof window !== 'undefined') {
          Promise.all([
            import('@tiptap/react'),
            import('tippy.js'),
          ]).then(([{ ReactRenderer }, { default: tippy }]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reactRenderer = new ReactRenderer(WikiLinkList, {
              props: props as object,
              editor: (props as any).editor,
            } as any)

            popup = tippy('body', {
              getReferenceClientRect: (props as { clientRect: (() => DOMRect) | null }).clientRect,
              appendTo: () => document.body,
              content: reactRenderer.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              theme: 'meridian',
            })
          })
        }
      },

      onUpdate(props: unknown) {
        reactRenderer?.updateProps(props)
        if (popup?.[0]) {
          popup[0].setProps({
            getReferenceClientRect: (props as { clientRect: (() => DOMRect) | null }).clientRect,
          })
        }
      },

      onKeyDown(props: { event: KeyboardEvent }): boolean {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide?.()
          return true
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (reactRenderer?.ref as any)?.onKeyDown(props.event) ?? false
      },

      onExit() {
        popup?.[0]?.destroy()
        reactRenderer?.destroy()
        popup = null
        reactRenderer = null
      },
    }),
  }
}
