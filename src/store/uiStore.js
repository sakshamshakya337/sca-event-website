import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Determine correct initial sidebar state based on screen width
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024

const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: !isMobile(), // false on mobile, true on desktop
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    }),
    {
      name: 'sca-ems-ui',
      // Only persist theme — sidebarOpen recalculates from screen width each load
      partialize: (state) => ({ theme: state.theme }),
      // Migration: wipe any old persisted state that included sidebarOpen
      version: 2,
      migrate: (persisted) => ({ theme: persisted?.theme || 'light' }),
    }
  )
)

export default useUiStore
