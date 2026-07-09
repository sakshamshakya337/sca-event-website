import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import useRateLimitStore from '../store/rateLimitStore'

export default function Error429() {
  const { rateLimitMessage, rateLimitRetryAfter, resetRateLimit } = useRateLimitStore()
  const [countdown, setCountdown] = useState(rateLimitRetryAfter || 60) // Default to 60s if not provided
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown <= 0) {
      resetRateLimit()
      navigate(-1) // Go back after countdown
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, navigate, resetRateLimit])

  // Reset rate limit when component unmounts
  useEffect(() => {
    return () => {
      resetRateLimit()
    }
  }, [resetRateLimit])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
          <AlertCircle size={64} className="mx-auto text-white mb-4" />
          <h1 className="text-4xl font-extrabold text-white mb-2">429</h1>
          <p className="text-orange-100 text-lg font-medium">Too Many Requests</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-on-surface-variant text-center mb-8">
            {rateLimitMessage || "You've exceeded the rate limit. Please wait a moment and try again."}
          </p>

          {/* Countdown Timer */}
          <div className="bg-surface-container rounded-2xl p-6 mb-8 border border-outline-variant">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock size={24} className="text-primary" />
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                Retry After
              </p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-extrabold text-primary font-mono">
                {formatTime(countdown)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>

            <Link
              to="/"
              className="w-full py-4 bg-surface-container text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container-high transition-all block text-center border border-outline-variant"
            >
              Go Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}