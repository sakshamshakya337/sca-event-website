import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { LayoutDashboard, Calendar, CheckSquare, Users, ShieldCheck, Mail, Settings, HelpCircle, LogOut, Menu, Bell, Image } from 'lucide-react'
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
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
  superadmin: [
    { path: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/events', label: 'All Events', icon: Calendar },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/verify', label: 'Verify Users', icon: ShieldCheck },
    { path: '/admin/queries', label: 'Contact Queries', icon: Mail },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
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
      {/* Overlay for mobile — only shown when sidebar IS open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen z-40 bg-surface-sidebar border-r border-outline-variant flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-[240px] translate-x-0' : 'w-[240px] -translate-x-full lg:w-[64px] lg:translate-x-0'}`}>

        {/* Logo + toggle */}
        <div className="px-4 py-4 flex items-center justify-between shrink-0 border-b border-outline-variant/50">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'lg:hidden'}`}>
            <img src="/sca.png" alt="SCA Logo" className="h-12 w-auto" />
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary shrink-0"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Nav — scrollable, takes all remaining space but never pushes bottom off screen */}
        <nav className="flex-1 min-h-0 flex flex-col gap-0.5 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/faculty' || item.path === '/admin' || item.path === '/superadmin'}
              onClick={() => {
                if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar()
              }}
              className={({ isActive }) =>
                `flex items-center px-5 py-3 transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                } ${!sidebarOpen && 'lg:justify-center lg:px-0'}`
              }
            >
              <item.icon className={`w-5 h-5 shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span className="font-body-md">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — user info + settings + logout, always visible */}
        <div className="shrink-0 border-t border-outline-variant">

          {/* Settings link */}
          <div className={`${!sidebarOpen && 'lg:hidden'}`}>
            <NavLink
              to={`/${user?.role}/profile`}
              onClick={() => { if (window.innerWidth < 1024 && sidebarOpen) toggleSidebar() }}
              className="flex items-center px-5 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
            >
              <Settings className="w-5 h-5 mr-3 shrink-0" />
              <span className="font-body-md">Settings</span>
            </NavLink>
          </div>

          {/* Settings icon-only when collapsed */}
          {!sidebarOpen && (
            <div className="hidden lg:flex justify-center py-2">
              <NavLink
                to={`/${user?.role}/profile`}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </NavLink>
            </div>
          )}

          {/* User info + logout */}
          <div className={`px-4 py-3 flex flex-col gap-2 ${!sidebarOpen && 'lg:hidden'}`}>
            <div className="flex items-center gap-2 min-w-0">
              {user?.profilePhotoUrl ? (
                <img
                  src={getCloudinaryUrl(user.profilePhotoUrl, { width: 36, height: 36 })}
                  alt={`${user.firstName || ''}`}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-9 h-9 rounded-full bg-primary-container items-center justify-center text-on-primary-container font-bold text-sm shrink-0 ${user?.profilePhotoUrl ? 'hidden' : 'flex'}`}>
                {getInitials()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-primary text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="font-code-sm text-on-surface-variant text-xs truncate">
                  {getIdentifier()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors w-full"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="font-body-sm font-semibold text-sm">Log Out</span>
            </button>
          </div>

          {/* Logout icon-only when collapsed */}
          {!sidebarOpen && (
            <div className="hidden lg:flex justify-center py-3">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </aside>
    </>
  )
}
