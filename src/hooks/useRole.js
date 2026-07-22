import useAuthStore from '../store/authStore'

export default function useRole() {
  const user = useAuthStore((state) => state.user)

  const role = user?.role
  const isStudent = role === 'student'
  const isFaculty = role === 'faculty' || role === 'hod' || role === 'faculty_coordinator'
  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperadmin = role === 'superadmin'

  const hasPermission = (allowedRoles) => {
    if (!Array.isArray(allowedRoles)) {
      allowedRoles = [allowedRoles]
    }
    return allowedRoles.includes(role)
  }

  return { role, isStudent, isFaculty, isAdmin, isSuperadmin, hasPermission }
}
