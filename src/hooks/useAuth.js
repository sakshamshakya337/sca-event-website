import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import api from '../config/axios'

export default function useAuth() {
  const { user, token, setUser, setIsLoading, isLoading } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    let aborted = false

    const checkAuth = async () => {
      if (token && !aborted) {
        try {
          const res = await api.get('/auth/me', { signal: new AbortController().signal })
          if (isMounted) {
            setUser(res.data.data)
          }
        } catch (error) {
          // Only logout if the server explicitly says the token is invalid/expired (401).
          // Never logout on network errors, 500s, or any other transient failures.
          const status = error?.response?.status
          if (status === 401 && isMounted && useAuthStore.getState().token) {
            useAuthStore.getState().logout()
          } else if (isMounted) {
            console.error('Failed to refresh user session (non-auth error):', error)
            // Keep existing user data instead of clearing it for transient errors
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      } else {
        setIsLoading(false)
      }
    }

    if (token) {
      checkAuth()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
      aborted = true
    }
  }, [token, setUser, setIsLoading])

  return { user, isLoading, token }
}
