'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Brain, Book, LogOut, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useReaderStore } from '@/stores/reader-store'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { fontSize, lineHeight, fontFamily, setFontSize, setLineHeight, setFontFamily } = useReaderStore()
  const [saved, setSaved] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sections = [
    {
      id: 'reader',
      icon: Book,
      title: 'Reader',
      description: 'Customize your reading experience',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Font size ({fontSize}px)</label>
            <input
              type="range" min={14} max={24} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Line height ({lineHeight})</label>
            <input
              type="range" min={1.4} max={2.2} step={0.1} value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">Font family</label>
            <div className="flex gap-2">
              {(['serif', 'sans'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f)}
                  className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                    fontFamily === f
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent-300)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                  style={{ fontFamily: f === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)' }}
                >
                  {f === 'serif' ? 'Serif (Lora)' : 'Sans-serif (Inter)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Customize your Meridian experience</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl">
        <div className="space-y-4">
          {sections.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[var(--color-accent-300)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{section.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{section.description}</p>
                  </div>
                </div>
                {section.content}
              </motion.div>
            )
          })}

          {/* Sign out */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Account</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Manage your account</p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
