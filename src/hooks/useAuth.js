import useAuthStore from '../store/authStore'

/**
 * Pure store reader — does NOT fire any API requests.
 * Auth initialization is done once at app level in AuthInitializer.
 */
export default function useAuth() {
  const { user, token, isLoading } = useAuthStore()
  return { user, isLoading, token }
}
