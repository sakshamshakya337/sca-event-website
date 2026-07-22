import { useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import api from '../config/axios'

/**
 * AuthInitializer — mounted ONCE at the root of the app.
 * Fires a single /auth/me request on startup to validate the stored token.
 * All other components (Navbar, Sidebar, ProtectedRoute…) simply read from
 * the Zustand store via useAuth() — they do NOT make their own API calls.
 */
export default function AuthInitializer() {
  const { token, setUser, setIsLoading, logout } = useAuthStore()
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Guard: only fetch once per app session, even in React Strict Mode double-invoke
    if (fetchedRef.current) return

    if (!token) {
      setIsLoading(false)
      return
    }

    // Optimistic UI: If we have a token stored, immediately unblock the UI.
    // The user will instantly see their dashboard while we verify the token in the background.
    // If the token is invalid, the catch block will log them out and redirect to login.
    setIsLoading(false)

    fetchedRef.current = true
    const controller = new AbortController()

    const init = async () => {
      try {
        const res = await api.get('/auth/me', { signal: controller.signal })
        setUser(res.data.data)
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return
        const status = err?.response?.status
        if (status === 401) {
          logout()
        } else {
          // Network/server error — keep existing cached user, just mark done
          console.warn('Auth refresh failed (non-auth error), using cached session:', err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    init()
    return () => controller.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentionally run once

  return null // renders nothing
}
