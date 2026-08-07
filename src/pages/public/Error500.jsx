import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ServerCrash, RefreshCw, Home, Activity, Send, CheckCircle2 } from 'lucide-react'

export default function Error500() {
  const navigate = useNavigate()
  const [reported, setReported] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleReload = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleReportBug = () => {
    setReported(true)
    setTimeout(() => {
      setReported(false)
    }, 4000)
  }

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
            School of Computer Applications — Event Platform
          </span>
          <Link
            to="/status"
            className="text-xs font-semibold text-primary bg-primary-fixed/40 px-3.5 py-1.5 rounded-full transition-colors border border-outline-variant flex items-center gap-1.5"
          >
            <Activity size={14} /> System Status
          </Link>
        </div>
      </div>

      {/* Main 500 Container */}
      <main className="w-full max-w-[540px] flex flex-col gap-6">
        <section className="rounded-3xl shadow-xl bg-surface-card p-6 sm:p-10 border border-outline-variant flex flex-col items-center text-center relative overflow-hidden">
          {/* Badge */}
          <div className="w-16 h-16 rounded-2xl bg-error-container/60 border border-outline-variant text-error flex items-center justify-center mb-4 shadow-inner">
            <ServerCrash size={32} />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-error-container/40 text-error text-xs font-mono font-bold tracking-wider uppercase mb-2 border border-outline-variant">
            Error Code 500
          </span>

          <h1 className="text-4xl font-black tracking-tight text-primary font-mono mb-2">
            Server Error
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mb-6">
            Something went wrong on our server while handling your request. Our technical team has been notified.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
            <button
              onClick={handleReload}
              disabled={isRefreshing}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-surface-card hover:bg-surface-container text-on-surface font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Retrying...' : 'Retry Page'}
            </button>

            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>

          {/* Report Issue Button */}
          <div className="w-full pt-4 border-t border-outline-variant">
            {reported ? (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary-fixed/40 py-2.5 px-4 rounded-xl border border-outline-variant">
                <CheckCircle2 size={16} /> Diagnostic report sent to SCA Technical Team!
              </div>
            ) : (
              <button
                onClick={handleReportBug}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Send automated error diagnostic report
              </button>
            )}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4 space-y-1">
          <p className="text-xs text-on-surface-variant">
            School of Computer Applications &copy; {new Date().getFullYear()} LPU. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs text-on-surface-variant">
            <Link to="/status" className="hover:text-primary hover:underline">Check Server Status</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-primary hover:underline">Contact Tech Support</Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
