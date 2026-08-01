import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  const bg = 'bg-[#f1f5f9]'
  const card = 'bg-white'
  const strip = 'bg-white border-[#E2E8F0]'
  const text = 'text-[#022448]'
  const sub = 'text-slate-500'

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-[Inter] ${bg}`}
      style={{
        backgroundImage: `radial-gradient(#1E3A5F 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header Strip — Matching Portal.jsx */}
      <div className={`w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl border ${strip}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src="/sca.png" alt="SCA Logo" className="h-14 sm:h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-slate-600 font-medium">
            School of Computer Applications
          </span>
        </div>
      </div>

      {/* Main 404 Card */}
      <main className="w-full max-w-[460px] flex flex-col gap-4 sm:gap-6">
        <section className={`rounded-2xl shadow-lg ${card} p-6 sm:p-10 border border-slate-100 flex flex-col items-center text-center`}>
          {/* SCA LPU Logo + Badge */}
          <Link to="/" className="hover:opacity-90 transition-opacity mb-4">
            <img src="/sca.png" alt="SCA Logo" className="h-20 sm:h-24 w-auto" />
          </Link>

          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-[#022448] flex items-center justify-center mb-3">
            <ShieldAlert size={28} className="text-[#2563EB]" />
          </div>

          <h1 className="text-5xl font-black tracking-tight text-[#022448] font-mono mb-2">
            404
          </h1>

          <h2 className={`text-xl font-bold ${text} mb-2`}>
            Page Not Found
          </h2>

          <p className={`text-xs sm:text-sm ${sub} leading-relaxed mb-8`}>
            The page you are looking for doesn't exist or has been moved. Please check the web address and try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 rounded-btn border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-btn bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <Home size={16} />
              Home Page
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            School of Computer Applications &copy; {new Date().getFullYear()} LPU. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
