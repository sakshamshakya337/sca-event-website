import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useRole from '../hooks/useRole'
import NotFound from '../pages/public/NotFound'

const PRIVILEGED_PATH_PREFIXES = ['/admin', '/hos', '/superadmin', '/dean']

export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuth()
  const { hasPermission } = useRole()
  const location = useLocation()

  const isPrivilegedRoute = PRIVILEGED_PATH_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Stealth 404 Protection for privileged routes
  if (!user) {
    if (isPrivilegedRoute) {
      return <NotFound />
    }
    return <Navigate to="/portal" replace />
  }

  if (user.mustChangePassword && !location.pathname.includes('/change-password')) {
    return <Navigate to="/change-password" replace />
  }

  if (!user.isVerified && !['admin', 'superadmin', 'dean', 'hos'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (role && !hasPermission(role)) {
    if (isPrivilegedRoute) {
      return <NotFound />
    }
    return <Navigate to="/portal" replace />
  }

  return children
}
