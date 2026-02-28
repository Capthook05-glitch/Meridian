'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Network, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Check your email</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            We sent a confirmation link to <span className="text-[var(--color-text)]">{email}</span>. Click the link to activate your account.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm text-[var(--color-accent-300)] hover:underline">
            Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Start building your personal knowledge base</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
              <Input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
              <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
              <Input type="password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" minLength={8} required />
            </div>

            {error && (
              <p className="text-xs text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" loading={loading}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-accent-300)] hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
