import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
    }),
    {
      name: 'sca-ems-ui',
    }
  )
)

export default useUiStore
