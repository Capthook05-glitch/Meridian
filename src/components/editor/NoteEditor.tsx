'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bold, Italic, Code, Highlighter, Heading2, Heading3, List, ListOrdered } from 'lucide-react'
import { createEditorExtensions } from '@/lib/tiptap/extensions'
import { buildWikiLinkSuggestion } from './WikiLinkSuggestion'
import { cn } from '@/lib/utils/cn'
import type { Note } from '@/types'

interface NoteEditorProps {
  note: Note
  onSave: (updates: { title: string; content: object; content_text: string }) => void
  className?: string
}

interface BubblePos {
  top: number
  left: number
}

export function NoteEditor({ note, onSave, className }: NoteEditorProps) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [bubblePos, setBubblePos] = useState<BubblePos | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: createEditorExtensions('Write something…', buildWikiLinkSuggestion()),
    content: (note.content as object) || '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'tiptap min-h-[calc(100vh-220px)]' },
    },
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        onSave({
          title: note.title,
          content: editor.getJSON(),
          content_text: editor.getText(),
        })
      }, 500)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from === to) {
        setBubblePos(null)
        return
      }
      // Position toolbar above the selection
      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0) {
        setBubblePos(null)
        return
      }
      const range = domSelection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const wrapperRect = editorWrapperRef.current?.getBoundingClientRect()
      if (!wrapperRect || rect.width === 0) {
        setBubblePos(null)
        return
      }
      setBubblePos({
        top: rect.top - wrapperRect.top - 48,
        left: Math.max(0, rect.left + rect.width / 2 - wrapperRect.left - 144),
      })
    },
  })

  // Hide bubble when clicking outside
  useEffect(() => {
    const hide = () => setBubblePos(null)
    document.addEventListener('mousedown', hide)
    return () => document.removeEventListener('mousedown', hide)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimeout.current)
  }, [])

  // Update content when note changes externally
  useEffect(() => {
    if (editor && note.content && JSON.stringify(editor.getJSON()) !== JSON.stringify(note.content)) {
      editor.commands.setContent(note.content as object)
    }
  }, [note.id, editor]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFormat = useCallback((format: string) => {
    if (!editor) return
    switch (format) {
      case 'bold': editor.chain().focus().toggleBold().run(); break
      case 'italic': editor.chain().focus().toggleItalic().run(); break
      case 'code': editor.chain().focus().toggleCode().run(); break
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case 'bullet': editor.chain().focus().toggleBulletList().run(); break
      case 'ordered': editor.chain().focus().toggleOrderedList().run(); break
      case 'highlight': editor.chain().focus().toggleHighlight({ color: 'var(--color-hl-yellow)' }).run(); break
    }
    setBubblePos(null)
  }, [editor])

  const TOOLBAR_ITEMS = editor ? [
    { id: 'bold', icon: Bold, active: editor.isActive('bold') },
    { id: 'italic', icon: Italic, active: editor.isActive('italic') },
    { id: 'code', icon: Code, active: editor.isActive('code') },
    { id: 'highlight', icon: Highlighter, active: editor.isActive('highlight') },
    { id: 'h2', icon: Heading2, active: editor.isActive('heading', { level: 2 }) },
    { id: 'h3', icon: Heading3, active: editor.isActive('heading', { level: 3 }) },
    { id: 'bullet', icon: List, active: editor.isActive('bulletList') },
    { id: 'ordered', icon: ListOrdered, active: editor.isActive('orderedList') },
  ] : []

  return (
    <div className={cn('relative', className)} ref={editorWrapperRef}>
      {/* Custom floating bubble toolbar */}
      {editor && bubblePos && (
        <div
          style={{ top: bubblePos.top, left: bubblePos.left }}
          className="absolute z-50 flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl p-1 pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {TOOLBAR_ITEMS.map(({ id, icon: Icon, active }) => (
            <button
              key={id}
              onMouseDown={(e) => { e.preventDefault(); toggleFormat(id) }}
              className={cn(
                'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                active
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent-300)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
