import { useLocation, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { MdNotifications, MdSunny, MdDarkMode, MdChevronRight, MdAdd, MdMenu } from 'react-icons/md'
import useUiStore from '../../store/uiStore'
import useNotificationsStore from '../../store/notificationsStore'
import { getCloudinaryUrl } from '../../lib/utils'

export default function Navbar({ breadcrumb = [] }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
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
      // Admins can create events too, so let's use the same page or create an admin one
      navigate('/faculty/events/create')
    }
  }

  return (
    <header className="h-[60px] flex justify-between items-center px-6 border-b border-outline-variant sticky top-0 bg-surface z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-surface-container rounded-full cursor-pointer text-on-surface-variant hover:text-primary transition-colors"
        >
          <MdMenu size={24} />
        </button>
        <nav className="flex items-center text-on-surface-variant font-body-sm text-body-sm">
          <span>Home</span>
          <MdChevronRight className="w-4 h-4 mx-2" />
          <span className="text-primary font-bold">{getPageTitle()}</span>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => navigate(`/${user?.role}/notifications`)}
            className="p-2 hover:bg-surface-container rounded-full relative cursor-pointer group"
          >
            <MdNotifications className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-surface">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-surface-container rounded-full cursor-pointer"
        >
          {theme === 'dark' ? (
            <MdSunny className="w-5 h-5 text-on-surface-variant" />
          ) : (
            <MdDarkMode className="w-5 h-5 text-on-surface-variant" />
          )}
        </button>
        
        {/* Add Create Event Button for Admin/Faculty */}
        {user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'faculty' ? (
          <button 
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition-all font-body-md text-body-md active:scale-95"
          >
            <MdAdd size={16} />
            Create New Event
          </button>
        ) : null}
        
        {user?.profilePhotoUrl ? (
          <img
            src={getCloudinaryUrl(user.profilePhotoUrl, { width: 40, height: 40 })}
            alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={`w-10 h-10 rounded-full bg-[#8B5CF6] items-center justify-center text-white text-sm font-bold cursor-pointer ${user?.profilePhotoUrl ? 'hidden' : 'flex'}`}>
          {getInitials()}
        </div>
      </div>
    </header>
  )
}
