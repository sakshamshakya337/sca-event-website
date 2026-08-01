import { Component } from 'react'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-[Inter] bg-[#f1f5f9]"
          style={{
            backgroundImage: `radial-gradient(#1E3A5F 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Top Header Strip */}
          <div className="w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl border bg-white border-[#E2E8F0]">
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="/" className="hover:opacity-90 transition-opacity">
                <img src="/sca.png" alt="SCA Logo" className="h-14 sm:h-16 w-auto" />
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                School of Computer Applications
              </span>
            </div>
          </div>

          {/* Main Error Card */}
          <main className="w-full max-w-[500px] flex flex-col gap-4 sm:gap-6">
            <section className="rounded-2xl shadow-lg bg-white p-6 sm:p-10 border border-slate-100 flex flex-col items-center text-center">
              <a href="/" className="hover:opacity-90 transition-opacity mb-4">
                <img src="/sca.png" alt="SCA Logo" className="h-20 sm:h-24 w-auto" />
              </a>

              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-3">
                <AlertOctagon size={28} />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#022448] mb-1">
                System Error
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                An unexpected application error occurred. Our engineering team has been notified.
              </p>

              {this.state.error?.message && (
                <div className="w-full bg-red-50/80 border-l-4 border-red-500 rounded-lg p-3 text-left mb-6 text-xs text-red-700 font-mono overflow-auto max-h-32">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 px-4 rounded-btn border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <RefreshCw size={16} />
                  Reload Page
                </button>

                <a
                  href="/"
                  className="flex-1 py-3 px-4 rounded-btn bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  <Home size={16} />
                  Go to Home
                </a>
              </div>
            </section>

            <footer className="text-center px-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                School of Computer Applications &copy; {new Date().getFullYear()} LPU. All rights reserved.
              </p>
            </footer>
          </main>
        </div>
      )
    }
    return this.props.children
  }
}
