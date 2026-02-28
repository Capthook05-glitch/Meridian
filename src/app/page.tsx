import Link from 'next/link'
import { Network, Library, Brain, Layout, Sparkles, ArrowRight, BookOpen, Highlighter, Link2 } from 'lucide-react'

const features = [
  {
    icon: Library,
    title: 'Reader',
    description: 'Save articles, PDFs, and web pages. Read distraction-free and highlight the most important passages.',
    color: 'text-[#818CF8]',
    bg: 'bg-[#6366F1]/10',
  },
  {
    icon: Brain,
    title: 'Spaced Repetition',
    description: 'Review your highlights using the SM-2 algorithm. Build lasting memory for the ideas that matter most.',
    color: 'text-[#34D399]',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Layout,
    title: 'Visual Canvas',
    description: 'Drag your notes and highlights onto an infinite whiteboard. Connect ideas visually.',
    color: 'text-[#F59E0B]',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI Chat',
    description: 'Ask questions about your knowledge base. Get answers grounded in your own notes and highlights.',
    color: 'text-[#A78BFA]',
    bg: 'bg-violet-500/10',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <Network className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--color-text)]">Meridian</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-600)] transition-colors font-medium">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-xs text-[var(--color-accent-300)] font-medium mb-6">
          <Sparkles className="h-3 w-3" /> Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight mb-5">
          Your second brain,<br />
          <span className="text-[var(--color-accent-300)]">beautifully connected</span>
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-8">
          Meridian combines the best of Heptabase, Readwise, and Reader into one seamless PKM.
          Read, highlight, review, and connect your knowledge visually — with AI that knows your notes.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-600)] transition-colors shadow-lg shadow-[var(--color-accent)]/20"
          >
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-6">
                <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Also includes */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-8">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 text-center">Everything you need in one place</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: BookOpen, label: '[[Wikilinks]]', desc: 'Bidirectional note linking' },
              { icon: Highlighter, label: 'Color highlights', desc: '6 highlight colors per article' },
              { icon: Link2, label: 'Backlinks', desc: 'See every note that links here' },
              { icon: Sparkles, label: 'AI summarization', desc: 'Instant article summaries' },
              { icon: Network, label: 'Semantic search', desc: 'Search by meaning, not keywords' },
              { icon: Brain, label: 'SM-2 algorithm', desc: 'Science-backed memory retention' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-[var(--color-accent-300)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
