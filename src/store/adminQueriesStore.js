import { create } from 'zustand'
import api from '../config/axios'

const normalizeQuery = (query) => ({
  ...query,
  id: query._id,
  date: query.createdAt
    ? new Date(query.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '',
  category: query.category || 'General',
  universityId: query.universityId || 'N/A',
})

const useAdminQueriesStore = create((set, get) => ({
  queries: [],
  isLoading: false,
  error: null,
  fetchQueries: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/contact')
      const queries = (res.data?.data || []).map(normalizeQuery)
      set({ queries, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch queries', isLoading: false })
    }
  },
  updateQueryStatus: async (id, status) => {
    try {
      const res = await api.put(`/contact/${id}`, { status })
      const updatedQuery = normalizeQuery(res.data?.data)
      set((state) => ({
        queries: state.queries.map((query) => (query.id === id ? updatedQuery : query)),
      }))
    } catch (err) {
      console.error('Failed to update query status', err)
    }
  },
  markAsRead: async (id) => {
    await get().updateQueryStatus(id, 'in_progress')
  },
  markAsReplied: async (id) => {
    await get().updateQueryStatus(id, 'resolved')
  },
  replyToQuery: async (id, replyMessage) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post(`/contact/${id}/reply`, { replyMessage })
      const updatedQuery = normalizeQuery(res.data?.data)
      set((state) => ({
        queries: state.queries.map((query) => (query.id === id ? updatedQuery : query)),
        isLoading: false,
      }))
      return updatedQuery
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reply'
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },
}))

export default useAdminQueriesStore
