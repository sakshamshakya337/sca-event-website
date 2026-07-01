import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import useUiStore from '../../store/uiStore'

export default function Portal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)

  const { theme } = useUiStore()
  const isDark = theme === 'dark'
  
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    // Client-side lockout (mirrors server-side)
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000)
      setError(`Too many attempts. Try again in ${secs}s.`)
      return
    }

    // Basic client-side validation
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email or ID.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password.length > 128) {
      setError('Password is too long.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/login', {
        email: trimmedEmail,
        password,
      })

      const { user, token } = res.data.data
      setAttempts(0)
      setLockedUntil(null)
      login(user, token)
      toast.success('Login successful!')

      const { addNotification } = (await import('../../store/notificationsStore')).default.getState()
      addNotification({
        title: 'Welcome back!',
        message: `Signed in as ${user.firstName} ${user.lastName} (${user.role}).`,
        type: 'success',
      })

      if (user.mustChangePassword) {
        navigate('/change-password')
      } else {
        const roleNavMap = {
          student: '/student',
          faculty: '/faculty',
          admin: '/admin',
          superadmin: '/superadmin',
        }
        navigate(roleNavMap[user.role] || '/student')
      }
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      // Lock client UI after 5 failed attempts for 15 min (same as server)
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 15 * 60 * 1000)
        setError('Too many failed attempts. Please wait 15 minutes.')
      } else {
        const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 font-[Inter] ${
      isDark ? 'bg-[#0B1120]' : 'bg-[#f1f5f9]'
    }`} style={{
      backgroundImage: `radial-gradient(${isDark ? '#374151' : '#1E3A5F'} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center',
    }}>
      {/* Top Strip */}
      <div className={`w-full max-w-[1400px] flex justify-between items-center px-6 py-4 mb-6 rounded-xl ${
        isDark ? 'bg-[#111827] border-b border-[#374151]' : 'bg-white border-b border-[#E2E8F0]'
      }`}>
        <div className="flex items-center gap-3">
          <img 
            src="/sca.png" 
            alt="SCA Logo" 
            className="w-10 h-10 object-contain" 
            style={{background:'transparent', border:'none', boxShadow:'none'}}
          />
          <span className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-[#022448]'}`}>
            SCA LPU
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>New here?</span>
          <Link
            to="/signup"
            className="bg-primary text-on-primary px-5 py-2 rounded-btn font-semibold flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            Create Account <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <main className={`w-full max-w-[440px] flex flex-col gap-6 animate-in fade-in zoom-in duration-500`}>
        {/* Brand Header (Card Header) */}
        <section className={`rounded-2xl shadow-modal ${
          isDark ? 'bg-[#1F2937]' : 'bg-white'
        } p-10`}>
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <img 
              src="/sca.png" 
              alt="SCA Logo" 
              className="w-16 h-16 object-contain mb-4" 
              style={{background:'transparent', border:'none', boxShadow:'none'}}
            />
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Welcome Back
            </h1>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } mt-1`}>
              School of Computer Applications, LPU
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Email address, registration number, or employee ID
              </label>
              <div className="relative">
                <BadgeCheck className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-[#74777f]'
                }`} size={20} />
                <input
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    isDark 
                      ? 'border-slate-600 bg-[#111827] text-slate-100 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
                      : 'border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
                  } transition-all`}
                  placeholder="Email, registration number, or employee ID"
                  type="text"
                  inputMode="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>Password</label>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-[#74777f]'
                }`} size={20} />
                <input
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border ${
                    isDark 
                      ? 'border-slate-600 bg-[#111827] text-slate-100 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
                      : 'border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
                  } transition-all`}
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#74777f] hover:text-[#022448]'
                  } transition-colors`}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`border-l-4 rounded-lg p-3 mb-2 ${
                isDark 
                  ? 'bg-red-900/20 border-red-800 text-red-400'
                  : 'bg-red-50 border-red-200 border-l-red-500 text-red-700'
              }`}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              disabled={loading || (lockedUntil && Date.now() < lockedUntil)}
              className="w-full py-3 font-semibold rounded-btn transition-all flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Logging in...
                </>
              ) : lockedUntil && Date.now() < lockedUntil ? (
                'Account locked — try later'
              ) : (
                <>
                  Enter Portal
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Footer Info */}
        <footer className="text-center px-6">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
            Forgot your credentials? Contact your department administrator or email{' '}
            <a className={`font-medium underline ${isDark ? 'text-blue-400' : 'text-[#2563EB]'}`} href="mailto:sca@lpu.edu.in">
              sca@lpu.edu.in
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}
