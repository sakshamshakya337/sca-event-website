import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { LayoutDashboard, Calendar, CheckSquare, Users, ShieldCheck, Mail, Settings, HelpCircle, LogOut, Menu, Bell } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'
import { getCloudinaryUrl } from '../../lib/utils'

const roleNavItems = {
  student: [
    { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/events', label: 'My Events', icon: Calendar },
    { path: '/student/tasks', label: 'My Tasks', icon: CheckSquare },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  faculty: [
    { path: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/faculty/events', label: 'My Events', icon: Calendar },
    { path: '/faculty/tasks', label: 'My Tasks', icon: CheckSquare },
    { path: '/faculty/notifications', label: 'Notifications', icon: Bell },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/events', label: 'All Events', icon: Calendar },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/verify', label: 'Verify Users', icon: ShieldCheck },
    { path: '/admin/queries', label: 'Contact Queries', icon: Mail },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
  superadmin: [
    { path: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/events', label: 'All Events', icon: Calendar },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/verify', label: 'Verify Users', icon: ShieldCheck },
    { path: '/admin/queries', label: 'Contact Queries', icon: Mail },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const { sidebarOpen, toggleSidebar } = useUiStore()
  
  const navItems = roleNavItems[user?.role] || []
  
  const handleLogout = () => {
    logout()
    navigate('/portal')
  }
  
  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }
  
  const getIdentifier = () => {
    if (!user) return ''
    if (user.role === 'student') return `Student • ${user.registrationNumber || 'N/A'}`
    if (user.role === 'faculty') return `Faculty • ${user.employeeId || 'N/A'}`
    return user.role.charAt(0).toUpperCase() + user.role.slice(1)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar - Academic Elite Theme */}
      <aside className={`fixed left-0 top-0 h-screen z-40 bg-surface-sidebar border-r border-outline-variant flex flex-col py-6 gap-6 transition-all duration-300 ${sidebarOpen ? 'w-[240px] translate-x-0' : 'w-[240px] -translate-x-full lg:w-[64px] lg:translate-x-0'}`}>
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:hidden'}`}>
            <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/faculty' || item.path === '/admin' || item.path === '/superadmin'}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`
              }
            >
              <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span className="font-body-md">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto px-6 pt-6 flex flex-col gap-4">
          <div className={`flex flex-col gap-1 ${!sidebarOpen && 'lg:hidden'}`}>
            <NavLink
              to={`/${user?.role}/profile`}
              className="flex items-center py-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Settings className="w-5 h-5 mr-3 text-[20px]" />
              <span className="font-body-md">Settings</span>
            </NavLink>
          </div>
          
          <div className={`pt-6 border-t border-outline-variant ${!sidebarOpen && 'lg:hidden'}`}>
            <div className="flex items-center gap-3">
              {user?.profilePhotoUrl ? (
                <img
                  src={getCloudinaryUrl(user.profilePhotoUrl, { width: 40, height: 40 })}
                  alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-primary-container items-center justify-center text-on-primary-container font-bold ${user?.profilePhotoUrl ? 'hidden' : 'flex'}`}>
                {getInitials()}
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-primary">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="font-code-sm text-on-surface-variant">
                  {getIdentifier()}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center text-error hover:opacity-80 transition-opacity"
            >
              <LogOut className="w-5 h-5 mr-2 text-[18px]" />
              <span className="font-body-sm font-semibold">LogOut</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
