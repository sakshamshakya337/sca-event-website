import { create } from 'zustand'
import api from '../config/axios'

const useAdminVerifyStore = create((set, get) => ({
  verifications: [],
  loading: false,
  error: null,

  fetchVerifications: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/verification')
      set({ verifications: res.data.data })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch verifications' })
    } finally {
      set({ loading: false })
    }
  },

  approveVerification: async (id, notes, checklist) => {
    try {
      const checklistObj = {}
      checklist.forEach(item => {
        checklistObj[`item${item.id}`] = item.checked
      })
      await api.put(`/verification/${id}/approve`, { adminNotes: notes, checklist: checklistObj })
      set((state) => ({
        verifications: state.verifications.map(v =>
          v._id === id ? { ...v, status: 'Approved', adminNotes: notes } : v
        ),
      }))
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to approve verification')
    }
  },

  rejectVerification: async (id, notes, checklist) => {
    try {
      const checklistObj = {}
      checklist.forEach(item => {
        checklistObj[`item${item.id}`] = item.checked
      })
      await api.put(`/verification/${id}/reject`, { rejectionReason: notes, adminNotes: notes, checklist: checklistObj })
      set((state) => ({
        verifications: state.verifications.map(v =>
          v._id === id ? { ...v, status: 'Rejected', adminNotes: notes } : v
        ),
      }))
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to reject verification')
    }
  },
}))

export default useAdminVerifyStore
