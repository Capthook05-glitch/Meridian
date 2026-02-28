'use client'

import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'
import { SaveURLDialog } from '@/components/reader/SaveURLDialog'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
      <CommandPalette />
      <SaveURLDialog />
    </div>
  )
}
