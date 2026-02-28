'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library, BookOpen, Brain, Layout, Search, MessageSquare,
  Settings, Plus, ChevronLeft, ChevronRight, Zap, Sparkles,
  GraduationCap, Network
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/stores/app-store'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/library', icon: Library, label: 'Library', description: 'Saved articles & PDFs' },
  { href: '/notes', icon: BookOpen, label: 'Notes', description: 'Your notes & ideas' },
  { href: '/canvas', icon: Layout, label: 'Canvas', description: 'Visual whiteboards' },
  { href: '/review', icon: Brain, label: 'Review', description: 'Spaced repetition' },
  { href: '/search', icon: Search, label: 'Search', description: 'Semantic search' },
  { href: '/ai', icon: Sparkles, label: 'AI Chat', description: 'Chat with your knowledge' },
]

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, setSaveURLDialogOpen, setCommandPaletteOpen } = useAppStore()

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 260 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="flex h-[52px] items-center justify-between px-3 border-b border-[var(--color-border)]">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <Network className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--color-text)] tracking-tight">Meridian</span>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mx-auto">
              <Network className="h-4 w-4 text-white" />
            </div>
          )}
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="text-[var(--color-text-tertiary)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick actions */}
        <div className="px-2 pt-3 pb-2">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSaveURLDialogOpen(true)}
                  className="w-full text-[var(--color-text-secondary)]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Add to library</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSaveURLDialogOpen(true)}
                className="flex-1 text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add to library
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="text-[var(--color-text-tertiary)] shrink-0"
              >
                <Zap className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return sidebarCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-full items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent-300)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent-300)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[var(--color-border)] px-2 py-3 space-y-0.5">
          {sidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-full text-[var(--color-text-tertiary)]">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}
          {bottomItems.map((item) => {
            const Icon = item.icon
            return sidebarCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className="flex h-9 w-full items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors">
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Link key={item.href} href={item.href} className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
