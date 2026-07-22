import { create } from 'zustand'
import api from '../config/axios'

const useAdminUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/users')
      set({ users: res.data.data })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch users' })
    } finally {
      set({ loading: false })
    }
  },

  addUser: async (userData) => {
    try {
      const res = await api.post('/users', userData)
      set((state) => ({ users: [...state.users, res.data.data.user] }))
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add user')
    }
  },

  updateUser: async (id, updatedData) => {
    try {
      const res = await api.put(`/users/${id}`, updatedData)
      set((state) => ({
        users: state.users.map(user => user._id === id ? res.data.data : user),
      }))
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update user')
    }
  },

  promoteToHod: async (id) => {
    try {
      const res = await api.put(`/users/${id}/promote-hod`)
      set((state) => ({
        users: state.users.map(user => user._id === id ? res.data.data : user),
      }))
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to promote to HOD')
    }
  },

  demoteToFaculty: async (id) => {
    try {
      const res = await api.put(`/users/${id}/demote-hod`)
      set((state) => ({
        users: state.users.map(user => user._id === id ? res.data.data : user),
      }))
      return res.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to demote to Faculty')
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`)
      set((state) => ({
        users: state.users.filter(user => user._id !== id),
      }))
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete user')
    }
  },
}))

export default useAdminUserStore
