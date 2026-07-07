import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useAuthStore from '../../store/authStore'
import { Bell, Sun, Moon, ChevronRight, Plus, Menu, Settings, LogOut } from 'lucide-react'
import useUiStore from '../../store/uiStore'
import useNotificationsStore from '../../store/notificationsStore'
import { getCloudinaryUrl } from '../../lib/utils'

export default function Navbar({ breadcrumb = [] }) {
  const { user } = useAuth()
  const logout = useAuthStore(state => state.logout)
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const { theme, toggleTheme, toggleSidebar, sidebarOpen } = useUiStore((state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme,
    toggleSidebar: state.toggleSidebar,
    sidebarOpen: state.sidebarOpen,
  }))
  const getUnreadCount = useNotificationsStore((state) => state.getUnreadCount)
  const unreadCount = getUnreadCount()
  
  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('notifications')) return 'Notifications'
    if (path.includes('events')) return 'Events'
    if (path.includes('tasks')) return 'Tasks'
    if (path.includes('profile')) return 'Profile'
    if (path.includes('users')) return 'Users'
    if (path.includes('verify')) return 'Verify Users'
    if (path.includes('queries')) return 'Contact Queries'
    return 'Dashboard'
  }

  const handleCreateEvent = () => {
    console.log('Navbar Create Event clicked, user role:', user?.role)
    if (user?.role === 'faculty') {
      navigate('/faculty/events/create')
    } else if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/faculty/events/create')
    }
  }

  return (
    <header className="h-[60px] flex justify-between items-center px-3 sm:px-6 border-b border-outline-variant sticky top-0 bg-surface z-30">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-surface-container rounded-lg cursor-pointer text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          <Menu size={24} />
        </button>
        <nav className="hidden sm:flex items-center text-on-surface-variant font-body-md">
          <Link to="/" className="hover:text-primary transition-colors cursor-pointer">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-primary font-bold">{getPageTitle()}</span>
        </nav>
        <span className="sm:hidden text-primary font-bold text-sm truncate">{getPageTitle()}</span>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-4 shrink-0">
        <div className="relative">
          <button 
            onClick={() => navigate(`/${user?.role}/notifications`)}
            className="p-2 hover:bg-surface-container rounded-lg relative cursor-pointer group"
          >
            <Bell className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-surface">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-surface-container rounded-lg cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-on-surface-variant" />
          ) : (
            <Moon className="w-5 h-5 text-on-surface-variant" />
          )}
        </button>
        
        {/* Create Event — hidden on mobile for students, shown for admin/faculty */}
        {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'faculty') && (
          <button 
            onClick={handleCreateEvent}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-btn hover:opacity-90 transition-all font-body-md active:scale-95 shadow-md text-sm"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Create New Event</span>
            <span className="md:hidden">New Event</span>
          </button>
        )}
        
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div onClick={() => setProfileOpen(!profileOpen)}>
            {user?.profilePhotoUrl ? (
              <img
                src={getCloudinaryUrl(user.profilePhotoUrl, { width: 40, height: 40 })}
                alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container items-center justify-center text-on-primary-container text-xs sm:text-sm font-bold cursor-pointer shrink-0 ${user?.profilePhotoUrl ? 'hidden' : 'flex'}`}>
              {getInitials()}
            </div>
          </div>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant py-2 z-50">
              <div className="px-4 py-2 border-b border-outline-variant mb-2">
                <p className="text-sm font-bold text-on-surface truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-on-surface-variant truncate capitalize">{user?.role}</p>
              </div>
              <Link 
                to={`/${user?.role}/profile`}
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                <Settings size={16} className="text-on-surface-variant" />
                My Profile
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false)
                  logout()
                  navigate('/portal')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
