import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, Bell, Settings } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useNotificationsStore from '../../store/notificationsStore'

export default function BottomNav() {
  const { user } = useAuth()
  const getUnreadCount = useNotificationsStore((state) => state.getUnreadCount)
  const unreadCount = getUnreadCount()
  
  // Basic routing for mobile nav
  let prefix = `/${user?.role}`
  if (user?.role === 'hod') prefix = '/faculty' // Because HOD uses faculty routes generally
  if (user?.role === 'superadmin' || user?.role === 'dean' || user?.role === 'hos') prefix = `/${user?.role}`
  if (user?.role === 'admin') prefix = '/admin'

  const navItems = [
    { path: prefix, label: 'Home', icon: LayoutDashboard },
    { path: `${prefix}/events`, label: 'Events', icon: Calendar },
    { path: `${prefix}/notifications`, label: 'Alerts', icon: Bell, badge: unreadCount },
    { path: `${prefix}/profile`, label: 'Profile', icon: Settings },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around items-center h-16 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          end={item.label === 'Home'}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <div className="relative">
            <item.icon className="w-5 h-5" strokeWidth={2.5} />
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-error text-on-error text-[8px] flex items-center justify-center rounded-full font-bold">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
