import axios from 'axios'
import useAuthStore from '../store/authStore'
import useRateLimitStore from '../store/rateLimitStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send HTTP-Only cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add auth token to headers if available
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
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

// Flag to prevent endless refresh loops
let isRefreshing = false

// Response interceptor: handle 429 rate limits & attempt token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status

    // Handle 429 Rate Limit Exceeded
    if (status === 429) {
      const retryAfterHeader = error.response?.headers?.['retry-after']
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60
      const message = error.response?.data?.message || 'Too many requests. Please try again later.'

      useRateLimitStore.getState().setRateLimited(true, message, retryAfter)

      if (window.location.pathname !== '/429') {
        window.location.href = '/429'
      }

      return Promise.reject(error)
    }

    // Handle 401 Unauthorized with token refresh attempt
    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/control-panel/auth/')) {
      if (isRefreshing) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshRes = await axios.post('/api/control-panel/auth/refresh-token', {}, { withCredentials: true })
        const newAccessToken = refreshRes.data?.data?.accessToken

        if (newAccessToken) {
          useAuthStore.getState().setToken(newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          isRefreshing = false
          return api(originalRequest)
        }
      } catch (refreshErr) {
        isRefreshing = false
        if (useAuthStore.getState().token) {
          useAuthStore.getState().logout()
        }
      }
    } else if (status === 401) {
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  }
)

export default api
