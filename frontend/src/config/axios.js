import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // Let axios set Content-Type for FormData automatically
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type')
      } else {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: only logout on 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // Only log user out on explicit 401 Unauthorized errors
    if (status === 401) {
      // Avoid logging out multiple times if already logged out
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout()
        console.warn('Logged out due to invalid/expired session (401)')
      }
    }
    // Reject the error for components to handle
    return Promise.reject(error)
  }
)

export default api
