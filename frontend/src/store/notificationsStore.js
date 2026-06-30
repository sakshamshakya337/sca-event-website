import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useNotificationsStore = create(
  persist(
    (set, get) => ({
      notifications: [
        { id: 1, title: 'New Event Approved', message: 'Your event "Annual Tech Fest" has been approved.', type: 'success', read: false, time: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, title: 'Verification Update', message: 'Your verification is under review.', type: 'info', read: false, time: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, title: 'Contact Query Received', message: 'A new contact query from John Doe.', type: 'warning', read: true, time: new Date(Date.now() - 86400000).toISOString() },
      ],
      addNotification: (notification) => {
        set((state) => ({
          notifications: [{ ...notification, id: Date.now(), time: new Date().toISOString(), read: false }, ...state.notifications],
        }))
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }))
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }))
      },
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }))
      },
      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      },
    }),
    {
      name: 'sca-ems-notifications',
    }
  )
)

export default useNotificationsStore