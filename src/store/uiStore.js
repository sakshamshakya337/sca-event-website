import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Determine correct initial sidebar state based on screen width
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024

const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: !isMobile(), // false on mobile, true on desktop
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'sca-ems-ui',
      // Only persist sidebarOpen (or nothing if sidebarOpen recalculates on load)
      partialize: (state) => ({}),
      // Migration: wipe any old persisted state that included sidebarOpen
      version: 2,
      migrate: (persisted) => ({ theme: persisted?.theme || 'light' }),
    }
  )
)

export default useUiStore
