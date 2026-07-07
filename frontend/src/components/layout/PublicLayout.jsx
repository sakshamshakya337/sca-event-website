import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import useAuthStore from '../../store/authStore'
import { getCloudinaryUrl } from '../../lib/utils'

// ─── Shared Navbar ────────────────────────────────────────────────────────────
function PublicNavbar({ scrolled }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const logout = useAuthStore(state => state.logout)
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
  
  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full h-[60px] z-50 flex justify-between items-center px-6 transition-all duration-300 border-b
          ${scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-outline-variant'
            : 'bg-background/80 backdrop-blur-md border-transparent'
          }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/sca.png" alt="SCA Logo" className="h-16 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors" to="/about">About</Link>
          <Link className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors" to="/events">Events</Link>
          <Link className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors" to="/gallery">Gallery</Link>
          <Link className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors" to="/contact">Contact</Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={`/${user.role}`}
                className="bg-primary text-on-primary px-5 py-2 rounded-btn text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Dashboard
                <LayoutDashboard size={15} />
              </Link>
              
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
                        navigate('/')
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
          ) : (
            <Link
              to="/portal"
              className="bg-primary text-on-primary px-5 py-2 rounded-btn text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Login
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 text-on-surface"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="w-[260px] bg-background border-l border-outline-variant flex flex-col p-6 gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <img src="/sca.png" alt="SCA" className="h-14 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {[['/', 'Home'], ['/about', 'About'], ['/events', 'Events'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors py-1 border-b border-outline-variant/40"
                >
                  {label}
                </Link>
              ))}
            </nav>
            {user ? (
              <div className="flex flex-col gap-2 mt-auto">
                <Link
                  to={`/${user.role}`}
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-btn text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                >
                  Dashboard <LayoutDashboard size={15} />
                </Link>
                <Link
                  to={`/${user.role}/profile`}
                  onClick={() => setMobileOpen(false)}
                  className="bg-surface-container text-on-surface px-5 py-2.5 rounded-btn text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-variant transition-all shadow-sm"
                >
                  My Profile <Settings size={15} />
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                    navigate('/')
                  }}
                  className="bg-error/10 text-error px-5 py-2.5 rounded-btn text-sm font-semibold flex items-center justify-center gap-2 hover:bg-error/20 transition-all shadow-sm"
                >
                  Logout <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/portal"
                onClick={() => setMobileOpen(false)}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-btn text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md mt-auto"
              >
                Login <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Shared Footer ────────────────────────────────────────────────────────────
function PublicFooter() {
  return (
    <footer className="bg-[#1a1714] text-[#e8e1dc] py-14 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <img src="/sca-white.png" alt="SCA Logo" className="h-12 w-auto opacity-90" />
            <p className="text-[#FFB68B]/75 text-sm leading-relaxed max-w-sm">
              Dedicated to enhancing the event management experience for the School of Computer Application at Lovely Professional University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-5 text-[#e8e1dc] text-xs uppercase tracking-widest">Quick Links</h5>
            <ul className="space-y-3 text-[#FFB68B]/75 text-sm">
              <li><Link className="hover:text-primary transition-colors" to="/about">About</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/events">Events</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/contact">Contact</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/portal">Faculty Portal</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-semibold mb-5 text-[#e8e1dc] text-xs uppercase tracking-widest">Legal</h5>
            <ul className="space-y-3 text-[#FFB68B]/75 text-sm">
              <li><Link className="hover:text-primary transition-colors" to="#">Terms of Use</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="#">Privacy Policy</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="#">LPU Guidelines</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-[#FFB68B]/50 text-xs">
          <p>© 2026 SCA — School of Computer Application, LPU. All Rights Reserved.</p>
          <p>
            Developed by{' '}
            <a
              href="https://www.sakshamshakya.tech/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-2"
            >
              Saksham Shakya
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Public Layout Wrapper ────────────────────────────────────────────────────
export default function PublicLayout({ children }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ensure dark mode is always disabled
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col">
      <PublicNavbar scrolled={scrolled} />
      <main className="flex-1 pt-[60px]">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
