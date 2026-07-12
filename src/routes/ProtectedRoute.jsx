import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useRole from '../hooks/useRole'

export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuth()
  const { hasPermission } = useRole()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/portal" replace />
  }

  if (user.mustChangePassword && !window.location.pathname.includes('/change-password')) {
    return <Navigate to="/change-password" replace />
  }

  if (!user.isVerified && !['admin', 'superadmin', 'dean', 'hos'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (role && !hasPermission(role)) {
    return <Navigate to="/portal" replace />
  }

  return children
}
