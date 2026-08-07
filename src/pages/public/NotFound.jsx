import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Compass, Calendar, Image, PhoneCall, HelpCircle, ShieldAlert } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const query = searchQuery.toLowerCase().trim()
    if (query.includes('event')) navigate('/events')
    else if (query.includes('gallery') || query.includes('photo')) navigate('/gallery')
    else if (query.includes('about')) navigate('/about')
    else if (query.includes('team') || query.includes('faculty')) navigate('/team')
    else if (query.includes('contact') || query.includes('support')) navigate('/contact')
    else if (query.includes('faq') || query.includes('help')) navigate('/faq')
    else navigate(`/events?search=${encodeURIComponent(searchQuery)}`)
  }

  const quickLinks = [
    { label: 'Explore Events', href: '/events', icon: Calendar },
    { label: 'Event Gallery', href: '/gallery', icon: Image },
    { label: 'Help & FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Contact Support', href: '/contact', icon: PhoneCall },
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans bg-background text-on-surface"
      style={{
        backgroundImage: `radial-gradient(var(--color-outline-variant) 0.8px, transparent 0.8px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header Strip */}
      <div className="w-full max-w-[1200px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-6 rounded-2xl border bg-surface-card/90 backdrop-blur border-outline-variant shadow-sm">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <img src="/sca.png" alt="SCA Logo" className="h-12 sm:h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-on-surface-variant font-medium hidden sm:inline">
            School of Computer Applications — LPU
          </span>
          <Link
            to="/portal"
            className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary-fixed/40 px-3.5 py-1.5 rounded-full transition-colors border border-outline-variant"
          >
            Portal Gateway &rarr;
          </Link>
        </div>
      </div>

      {/* Main 404 Container */}
      <main className="w-full max-w-[620px] flex flex-col gap-6">
        <section className="rounded-3xl shadow-xl bg-surface-card p-6 sm:p-10 border border-outline-variant flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle primary glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/60 border border-outline-variant text-primary flex items-center justify-center mb-4 shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-surface-container text-primary text-xs font-mono font-bold tracking-wider uppercase mb-2 border border-outline-variant">
            Error Code 404
          </span>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-primary font-mono mb-2">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-md mb-6">
            The page or event resource you are looking for doesn't exist, may have expired, or has been relocated.
          </p>

          {/* Interactive Search Box */}
          <form onSubmit={handleSearchSubmit} className="w-full relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, gallery, support..."
              className="w-full pl-11 pr-24 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-card transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-3.5 text-on-surface-variant" size={18} />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              Search
            </button>
          </form>

          {/* Suggested Quick Links Grid */}
          <div className="w-full text-left mb-6">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass size={14} className="text-primary" />
              Suggested Destination Links
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {quickLinks.map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link
                    key={idx}
                    to={item.href}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant bg-surface-container/60 text-on-surface hover:bg-surface-container hover:border-primary text-xs font-semibold transition-all duration-200"
                  >
                    <Icon size={16} className="text-primary" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-outline-variant">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-surface-card hover:bg-surface-container text-on-surface font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4 space-y-1">
          <p className="text-xs text-on-surface-variant">
            School of Computer Applications &copy; {new Date().getFullYear()} LPU. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs text-on-surface-variant">
            <Link to="/faq" className="hover:text-primary hover:underline">FAQ</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-primary hover:underline">Support</Link>
            <span>&bull;</span>
            <Link to="/status" className="hover:text-primary hover:underline">System Status</Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
