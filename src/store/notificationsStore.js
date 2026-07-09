import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useNotificationsStore = create(
  persist(
    (set, get) => ({
      // Start with an empty list — notifications are added by real actions
      notifications: [],

      // Called by event/auth/verification actions across the app
      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now(),
              time: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: 'sca-ems-notifications',
      // Only persist the notifications array, not actions
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
)

export default useNotificationsStore
