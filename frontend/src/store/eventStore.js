import { create } from 'zustand'
import api from '../config/axios'

const useEventStore = create((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  selectedEvent: null,
  
  // Fetch events
  fetchEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/events')
      set({ events: res.data.data, isLoading: false })
    } catch (err) {
      console.error('Failed to fetch events:', err)
      set({ error: err.response?.data?.message || 'Failed to fetch events', isLoading: false })
    }
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get(`/events/${id}`)
      set({ selectedEvent: res.data.data, isLoading: false })
      return res.data.data
    } catch (err) {
      console.error('Failed to fetch event by id:', err)
      set({ error: err.response?.data?.message || 'Failed to fetch event', isLoading: false })
      return null
    }
  },

  // Add event
  addEvent: async (eventData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/events', eventData)
      set((state) => ({
        events: [res.data.data, ...state.events],
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to add event:', err)
      set({ error: err.response?.data?.message || 'Failed to add event', isLoading: false })
      throw err
    }
  },

  // Update event
  updateEvent: async (id, updatedEvent) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/events/${id}`, updatedEvent)
      set((state) => ({
        events: state.events.map(event => event._id === id ? res.data.data : event),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to update event:', err)
      set({ error: err.response?.data?.message || 'Failed to update event', isLoading: false })
      throw err
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/events/${id}`)
      set((state) => ({
        events: state.events.filter(event => event._id !== id),
        isLoading: false
      }))
    } catch (err) {
      console.error('Failed to delete event:', err)
      set({ error: err.response?.data?.message || 'Failed to delete event', isLoading: false })
      throw err
    }
  },
  
  // Admin approval
  approveEvent: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/events/${id}/approve`)
      set((state) => ({
        events: state.events.map(event => event._id === id ? res.data.data : event),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to approve event:', err)
      set({ error: err.response?.data?.message || 'Failed to approve event', isLoading: false })
      throw err
    }
  },

  rejectEvent: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/events/${id}/reject`)
      set((state) => ({
        events: state.events.map(event => event._id === id ? res.data.data : event),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to reject event:', err)
      set({ error: err.response?.data?.message || 'Failed to reject event', isLoading: false })
      throw err
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
}))

export default useEventStore
