'use client'

import { useCallback, useRef, useEffect } from 'react'
import { Tldraw, type Editor, type TLEditorSnapshot, type TLStoreSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import type { Canvas } from '@/types'

interface CanvasEditorProps {
  canvas: Canvas
  onSave: (snapshot: TLEditorSnapshot) => void
}

export function CanvasEditor({ canvas, onSave }: CanvasEditorProps) {
  const editorRef = useRef<Editor | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor

    // Load existing canvas data
    if (canvas.tldraw_document) {
      try {
        editor.loadSnapshot(canvas.tldraw_document as unknown as TLStoreSnapshot)
      } catch (e) {
        console.warn('Could not load canvas snapshot:', e)
      }
    }

    // Auto-save on changes with debounce
    editor.store.listen(
      () => {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => {
          const snapshot = editor.getSnapshot()
          onSave(snapshot)
        }, 1000)
      },
      { source: 'user', scope: 'document' }
    )
  }, [canvas.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => clearTimeout(saveTimeout.current)
  }, [])

  return (
    <div className="h-full w-full" style={{ '--tl-background': 'var(--color-bg)' } as React.CSSProperties}>
      <Tldraw
        onMount={handleMount}
        inferDarkMode
        className="h-full w-full"
      />
    </div>
  )
}
