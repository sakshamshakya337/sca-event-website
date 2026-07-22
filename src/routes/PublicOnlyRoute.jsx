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
    if (user.isVerified || ['admin', 'superadmin', 'dean', 'hos'].includes(user.role)) {
      const dashboardMap = {
        student:             '/student',
        club_president:      '/student',
        club_vice_president: '/student',
        faculty:             '/faculty',
        faculty_coordinator: '/faculty',
        hod:                 '/faculty', // HOD main dashboard is the faculty portal, they use the sidebar to access HOD features
        admin:               '/admin',
        dean:                '/dean',
        hos:                 '/hos',
        superadmin:          '/superadmin',
      }
      return <Navigate to={dashboardMap[user.role] || '/student'} replace />
    }
  }

  return children
}
