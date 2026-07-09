import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useRole from '../hooks/useRole'

export default function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth()
  const { isStudent, isFaculty, isAdmin, isSuperadmin } = useRole()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  if (user) {
    if (user.mustChangePassword) {
      return <Navigate to="/change-password" replace />
    }
    if (user.isVerified) {
      if (isStudent) return <Navigate to="/student" replace />
      if (isFaculty) return <Navigate to="/faculty" replace />
      if (isAdmin) return <Navigate to="/admin" replace />
      if (isSuperadmin) return <Navigate to="/superadmin" replace />
    }
  }

  return children
}
