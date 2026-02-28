'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Link2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/stores/app-store'
import { useQueryClient } from '@tanstack/react-query'

export function SaveURLDialog() {
  const { saveURLDialogOpen, setSaveURLDialogOpen } = useAppStore()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setStatus('error')
        setMessage('Already saved! Opening...')
        setTimeout(() => {
          setSaveURLDialogOpen(false)
          router.push(`/library/${data.id}`)
          reset()
        }, 1200)
        return
      }

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to save article')
        return
      }

      setStatus('success')
      setMessage('Saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['documents'] })

      setTimeout(() => {
        setSaveURLDialogOpen(false)
        router.push(`/library/${data.id}`)
        reset()
      }, 1000)
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  function reset() {
    setUrl('')
    setStatus('idle')
    setMessage('')
  }

  return (
    <Dialog open={saveURLDialogOpen} onOpenChange={(open) => { setSaveURLDialogOpen(open); if (!open) reset() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save to library</DialogTitle>
          <DialogDescription>Paste a URL to save an article, blog post, or web page for later reading.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
              autoFocus
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                status === 'success'
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20'
                  : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20'
              }`}
            >
              {status === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {message}
            </motion.div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => { setSaveURLDialogOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" loading={status === 'loading'} disabled={!url.trim() || status === 'success'}>
              {status === 'loading' ? 'Saving…' : 'Save article'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
