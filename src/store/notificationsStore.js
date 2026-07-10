import { create } from 'zustand'
import api from '../config/axios'

const normalizeNotification = (n) => ({
  id: n._id || n.id,
  title: n.title,
  message: n.message,
  type: n.type || 'info',
  read: n.read || false,
  time: n.createdAt || n.time || new Date().toISOString(),
})

const useNotificationsStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/notifications')
      const notifications = (res.data?.data || []).map(normalizeNotification)
      set({ notifications, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch notifications', isLoading: false })
    }
  },

  addNotification: (notification) => {
    // Keep local add compatibility for frontend-only actions
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: notification.id || Date.now(),
          time: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    }))
  },

  markAsRead: async (id) => {
    const isDbId = typeof id === 'string' && id.length === 24
    if (isDbId) {
      try {
        await api.put(`/notifications/${id}/read`)
      } catch (err) {
        console.error('Failed to mark notification as read on backend', err)
      }
    }
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all')
    } catch (err) {
      console.error('Failed to mark all as read on backend', err)
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  deleteNotification: async (id) => {
    const isDbId = typeof id === 'string' && id.length === 24
    if (isDbId) {
      try {
        await api.delete(`/notifications/${id}`)
      } catch (err) {
        console.error('Failed to delete notification on backend', err)
      }
    }
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => set({ notifications: [] }),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length
  },

  sendAdminNotification: async (data) => {
    try {
      const res = await api.post('/notifications/send-admin', data)
      return res.data?.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send notification')
    }
  }
}))

export default useNotificationsStore
