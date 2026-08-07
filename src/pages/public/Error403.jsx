import { Link, useNavigate } from 'react-router-dom'
import { ShieldX, Home, LogIn, ArrowLeft, Lock, HelpCircle } from 'lucide-react'

export default function Error403() {
  const navigate = useNavigate()

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
            School of Computer Applications — Security Gateway
          </span>
          <Link
            to="/portal"
            className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary-fixed/40 px-3.5 py-1.5 rounded-full transition-colors border border-outline-variant"
          >
            Switch Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Main 403 Container */}
      <main className="w-full max-w-[520px] flex flex-col gap-6">
        <section className="rounded-3xl shadow-xl bg-surface-card p-6 sm:p-10 border border-outline-variant flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/60 border border-outline-variant text-primary flex items-center justify-center mb-4 shadow-inner">
            <ShieldX size={32} />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-surface-container text-primary text-xs font-mono font-bold tracking-wider uppercase mb-2 border border-outline-variant">
            Error Code 403
          </span>

          <h1 className="text-4xl font-black tracking-tight text-primary font-mono mb-2">
            Access Forbidden
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mb-6">
            You don't have authorization or clearance to access this portal section with your current logged-in role.
          </p>

          {/* Security Notice Box */}
          <div className="w-full bg-surface-container border border-outline-variant rounded-2xl p-4 text-left mb-6 space-y-2 text-xs text-on-surface">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Lock size={15} />
              <span>Restricted Clearance Path</span>
            </div>
            <p className="leading-normal text-on-surface-variant">
              If you are a Faculty, HOD, Dean, or Student needing access, please ensure you sign in through the unified portal.
            </p>
          </div>

          {/* Core Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant bg-surface-card hover:bg-surface-container text-on-surface font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              to="/portal"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <LogIn size={16} />
              Login Portal
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant w-full flex justify-between items-center text-xs text-on-surface-variant">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home size={14} /> Home Page
            </Link>
            <Link to="/faq" className="hover:text-primary flex items-center gap-1">
              <HelpCircle size={14} /> Account Help
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4">
          <p className="text-xs text-on-surface-variant">
            School of Computer Applications &copy; {new Date().getFullYear()} LPU. Security Protocols Active.
          </p>
        </footer>
      </main>
    </div>
  )
}
