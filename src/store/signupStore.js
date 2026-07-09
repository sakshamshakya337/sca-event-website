import { create } from 'zustand'

const useSignupStore = create((set) => ({
  role: null, // 'student' or 'faculty'
  details: {}, // student/faculty details
  documents: {}, // uploaded documents
  setRole: (role) => set({ role }),
  setDetails: (details) => set((state) => ({ details: { ...state.details, ...details } })),
  setDocuments: (documents) => set((state) => ({ documents: { ...state.documents, ...documents } })),
  resetSignup: () => set({ role: null, details: {}, documents: {} }),
}))

export default useSignupStore
