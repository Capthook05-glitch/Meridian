'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

type AddMode = 'url' | 'pdf'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function AddToLibraryPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AddMode>('url')

  // URL mode state
  const [url, setUrl] = useState('')
  const [urlStatus, setUrlStatus] = useState<Status>('idle')
  const [urlError, setUrlError] = useState('')

  // PDF mode state
  const [file, setFile] = useState<File | null>(null)
  const [pdfStatus, setPdfStatus] = useState<Status>('idle')
  const [pdfError, setPdfError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL submission
  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setUrlStatus('loading')
    setUrlError('')
    try {
      const res = await fetch('/api/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save article')
      }
      setUrlStatus('success')
      setTimeout(() => router.push(`/library/${data.id}`), 1200)
    } catch (err) {
      setUrlStatus('error')
      setUrlError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // PDF drag-and-drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setPdfError('')
    } else {
      setPdfError('Please drop a PDF file')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPdfError('')
    }
  }

  // PDF upload
  const handlePDFUpload = async () => {
    if (!file) return
    setPdfStatus('loading')
    setPdfError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/documents/ingest', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPdfStatus('success')
      setTimeout(() => router.push(`/library/${data.id}`), 1200)
    } catch (err) {
      setPdfStatus('error')
      setPdfError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Add to Library</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Save an article, PDF, or any URL to your knowledge base</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-[var(--color-bg-tertiary)] rounded-lg mb-8">
            {([['url', Link2, 'Save URL'], ['pdf', FileText, 'Upload PDF']] as const).map(([m, Icon, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'url' ? (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <form onSubmit={handleURLSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Article URL</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                      <Input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="pl-9"
                        disabled={urlStatus === 'loading' || urlStatus === 'success'}
                        autoFocus
                      />
                    </div>
                  </div>

                  {urlError && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {urlError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!url.trim() || urlStatus === 'loading' || urlStatus === 'success'}
                    className="w-full"
                  >
                    {urlStatus === 'loading' ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving article…</>
                    ) : urlStatus === 'success' ? (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved! Redirecting…</>
                    ) : (
                      <><Link2 className="h-4 w-4 mr-2" /> Save to Library</>
                    )}
                  </Button>
                </form>

                {/* Example URLs */}
                <div className="mt-8">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider">Works with</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Blog posts', 'Medium, Substack, personal blogs'],
                      ['News articles', 'NYT, The Atlantic, Wired'],
                      ['Research papers', 'arXiv, PubMed, SSRN'],
                      ['Documentation', 'MDN, React Docs, any webpage'],
                    ].map(([title, desc]) => (
                      <div key={title} className="rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] px-3 py-2.5">
                        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                      isDragging
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-bg-hover)]'
                    )}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn(
                        'h-14 w-14 rounded-2xl flex items-center justify-center transition-colors',
                        isDragging ? 'bg-[var(--color-accent)]/20' : 'bg-[var(--color-bg-tertiary)]'
                      )}>
                        <Upload className={cn('h-7 w-7', isDragging ? 'text-[var(--color-accent-300)]' : 'text-[var(--color-text-tertiary)]')} />
                      </div>
                      <div>
                        <p className="text-[var(--color-text)] font-medium">
                          {isDragging ? 'Drop your PDF here' : 'Drag & drop a PDF'}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          or <span className="text-[var(--color-accent-300)]">click to browse</span>
                        </p>
                      </div>
                      <p className="text-xs text-[var(--color-text-tertiary)]">PDF files only · Max 50MB</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4 flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-[var(--color-accent-300)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{file.name}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {pdfStatus === 'idle' && (
                      <button onClick={() => { setFile(null); setPdfError('') }} className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)]">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                )}

                {pdfError && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {pdfError}
                  </div>
                )}

                <Button
                  onClick={handlePDFUpload}
                  disabled={!file || pdfStatus === 'loading' || pdfStatus === 'success'}
                  className="w-full"
                >
                  {pdfStatus === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading PDF…</>
                  ) : pdfStatus === 'success' ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved! Redirecting…</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload to Library</>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
