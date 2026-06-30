import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import api from '../config/axios'

export default function useAuth() {
  const { user, token, setUser, setIsLoading, isLoading } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me')
          if (isMounted) {
            setUser(res.data.data)
          }
        } catch (error) {
          console.error('AlertCircle fetching user:', error)
          useAuthStore.getState().logout()
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      } else {
        setIsLoading(false)
      }
    }
    checkAuth()

    return () => {
      isMounted = false
    }
  }, [token, setUser, setIsLoading])

  return { user, isLoading, token }
}
