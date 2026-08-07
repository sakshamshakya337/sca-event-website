import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, RefreshCw, Clock, ShieldCheck } from 'lucide-react'

export default function Maintenance() {
  const [countdown, setCountdown] = useState(1800) // 30 minutes countdown default
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 600)
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
            School of Computer Applications — Scheduled Maintenance
          </span>
          <span className="px-3.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold border border-outline-variant flex items-center gap-1.5">
            <Wrench size={14} /> Maintenance In Progress
          </span>
        </div>
      </div>

      {/* Main Maintenance Container */}
      <main className="w-full max-w-[540px] flex flex-col gap-6">
        <section className="rounded-3xl shadow-xl bg-surface-card p-6 sm:p-10 border border-outline-variant flex flex-col items-center text-center relative overflow-hidden">
          {/* Badge */}
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/60 border border-outline-variant text-primary flex items-center justify-center mb-4 shadow-inner">
            <Wrench size={32} />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-surface-container text-primary text-xs font-mono font-bold tracking-wider uppercase mb-2 border border-outline-variant">
            System Maintenance Mode
          </span>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-primary mb-2 font-mono">
            Under Maintenance
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed max-w-md mb-6">
            We are currently upgrading server infrastructure and performing routine database optimization to improve platform performance.
          </p>

          {/* Countdown Widget */}
          <div className="w-full bg-surface-container rounded-2xl p-5 mb-6 border border-outline-variant flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
              <Clock size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Estimated Completion In</span>
            </div>
            <span className="text-4xl font-extrabold text-primary font-mono tracking-widest">
              {formatTime(countdown)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-surface-card hover:bg-surface-container text-on-surface font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Checking...' : 'Check Again'}
            </button>

            <Link
              to="/status"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <ShieldCheck size={16} />
              Status Dashboard
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4">
          <p className="text-xs text-on-surface-variant">
            School of Computer Applications &copy; {new Date().getFullYear()} LPU. Thank you for your patience.
          </p>
        </footer>
      </main>
    </div>
  )
}
