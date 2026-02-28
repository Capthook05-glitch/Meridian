import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  saveURLDialogOpen: boolean
  activeSpaceId: string | null
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  setSaveURLDialogOpen: (v: boolean) => void
  setActiveSpaceId: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      saveURLDialogOpen: false,
      activeSpaceId: null,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setSaveURLDialogOpen: (v) => set({ saveURLDialogOpen: v }),
      setActiveSpaceId: (id) => set({ activeSpaceId: id }),
    }),
    { name: 'meridian-app', partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) }
  )
)
