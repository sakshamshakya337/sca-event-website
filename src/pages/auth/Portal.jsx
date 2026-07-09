import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import useUiStore from '../../store/uiStore'
import RecaptchaWidget from '../../components/ui/RecaptchaWidget'

export default function Portal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)

  const { theme } = useUiStore()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000)
      setError(`Too many attempts. Try again in ${secs}s.`)
      return
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) { setError('Please enter your email or ID.'); return }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password.length > 128) { setError('Password is too long.'); return }
    if (!captchaToken) { setError('Please complete the security verification.'); return }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email: trimmedEmail, password })
      const { user, token } = res.data.data
      setAttempts(0)
      setLockedUntil(null)
      login(user, token)
      toast.success('Login successful!')

      if (user.mustChangePassword) {
        navigate('/change-password')
      } else {
        const roleNavMap = { student: '/student', faculty: '/faculty', admin: '/admin', superadmin: '/superadmin' }
        navigate(roleNavMap[user.role] || '/student')
      }
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 15 * 60 * 1000)
        setError('Too many failed attempts. Please wait 15 minutes.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const bg    = isDark ? 'bg-[#0B1120]'   : 'bg-[#f1f5f9]'
  const card  = isDark ? 'bg-[#1F2937]'   : 'bg-white'
  const strip = isDark ? 'bg-[#111827] border-[#374151]' : 'bg-white border-[#E2E8F0]'
  const text  = isDark ? 'text-slate-100' : 'text-[#022448]'
  const sub   = isDark ? 'text-slate-400' : 'text-slate-500'
  const label = isDark ? 'text-slate-300' : 'text-slate-700'
  const inp   = isDark
    ? 'border-slate-600 bg-[#111827] text-slate-100 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'
    : 'border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent focus:outline-none'

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-[Inter] ${bg}`}
      style={{
        backgroundImage: `radial-gradient(${isDark ? '#374151' : '#1E3A5F'} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top strip — responsive */}
      <div className={`w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl border ${strip}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src="/sca.png" alt="SCA Logo" className="h-14 sm:h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-xs sm:text-sm hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            New here?
          </span>
          <Link
            to="/signup"
            className="bg-primary text-on-primary px-3 sm:px-5 py-1.5 sm:py-2 rounded-btn font-semibold flex items-center gap-1 sm:gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all text-xs sm:text-sm"
          >
            Sign Up <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main card */}
      <main className="w-full max-w-[440px] flex flex-col gap-4 sm:gap-6">
        <section className={`rounded-2xl shadow-lg ${card} p-6 sm:p-10`}>
          {/* Logo + heading */}
          <div className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <img src="/sca.png" alt="SCA Logo" className="h-20 sm:h-24 w-auto mb-2 sm:mb-4" />
            </Link>
            <h1 className={`text-xl sm:text-2xl font-bold ${text}`}>Welcome Back</h1>
            <p className={`text-xs sm:text-sm ${sub} mt-0.5`}>School of Computer Applications, LPU</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Email / ID */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs sm:text-sm font-medium ${label}`}>
                Email, registration number, or employee ID
              </label>
              <div className="relative">
                <BadgeCheck className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-[#74777f]'}`} size={18} />
                <input
                  className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                  placeholder="Email, reg. number, or employee ID"
                  type="text"
                  inputMode="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs sm:text-sm font-medium ${label}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-[#74777f]'}`} size={18} />
                <input
                  className={`w-full pl-9 pr-11 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#74777f] hover:text-[#022448]'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={`border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-l-red-500 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className={`text-xs font-medium hover:underline ${isDark ? 'text-blue-400' : 'text-primary'}`}
              >
                Forgot password?
              </Link>
            </div>

            {/* hCaptcha */}
            <RecaptchaWidget
              ref={recaptchaRef}
              onChange={setCaptchaToken}
              theme={isDark ? 'dark' : 'light'}
            />

            {/* Submit */}
            <button
              disabled={loading || !captchaToken || Boolean(lockedUntil && Date.now() < lockedUntil)}
              className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
            >
              {loading
                ? <><Loader2 className="animate-spin" size={16} /> Logging in…</>
                : (lockedUntil && Date.now() < lockedUntil)
                ? 'Account locked — try later'
                : <><span>Login</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
        </section>

        {/* Footer note */}
        <footer className="text-center px-4">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
            <Link to="/forgot-password" className={`font-medium underline ${isDark ? 'text-blue-400' : 'text-[#2563EB]'}`}>
              Forgot your password?
            </Link>
            {' '}· Need help? Email{' '}
            <a href="mailto:sca@lpu.edu.in" className={`font-medium underline ${isDark ? 'text-blue-400' : 'text-[#2563EB]'}`}>
              sca@lpu.edu.in
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}
