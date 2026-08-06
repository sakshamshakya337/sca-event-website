import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import TurnstileWidget from '../../components/security/TurnstileWidget'

export default function Portal() {
  // Step flow: 1 = Initial Login/Validation, 2 = Authority OTP Verification, 3 = Authority Password Entry
  const [step, setStep] = useState(1)

  // Input states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Authority 2FA states
  const [maskedEmail, setMaskedEmail] = useState('')
  const [canonicalIdentifier, setCanonicalIdentifier] = useState('')
  const [preAuthToken, setPreAuthToken] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [isPrivileged, setIsPrivileged] = useState(false)

  // UI & status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)

  const recaptchaRef = useRef(null)
  const otpInputRefs = useRef([])
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)

  // Role navigation map
  const roleNavMap = {
    student: '/student',
    club_president: '/student',
    club_vice_president: '/student',
    faculty: '/faculty',
    faculty_coordinator: '/faculty',
    admin: '/admin',
    dean: '/dean',
    hos: '/hos',
    hod: '/faculty',
    superadmin: '/superadmin',
  }

  // OTP resend countdown timer
  useEffect(() => {
    let timer
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  // Complete final login session
  const completeAuth = (user, token) => {
    loginStore(user, token)
    toast.success(`Welcome back, ${user.firstName}!`)
    if (user.mustChangePassword) {
      navigate('/change-password')
    } else {
      navigate(roleNavMap[user.role] || '/student', { replace: true })
    }
  }

  // Step 1: Universal Login / Authority Detection
  const handleInitialSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000)
      setError(`Too many attempts. Try again in ${secs}s.`)
      return
    }

    const trimmedIdentifier = email.trim()
    if (!trimmedIdentifier) {
      setError('Please enter your email, registration number, or employee ID.')
      return
    }

    if (!captchaToken) {
      setError('Please complete the security verification.')
      return
    }

    setLoading(true)
    try {
      // 1. Detect if identifier belongs to a Higher Authority / Privileged Role
      const checkRes = await api.post('/auth/validate-portal-user', {
        identifier: trimmedIdentifier,
        turnstileToken: captchaToken,
      })

      const checkData = checkRes.data.data

      if (checkData.isPrivileged) {
        // ── Privileged Authority User Detected ──────────────────────────────────
        setIsPrivileged(true)
        setMaskedEmail(checkData.maskedEmail)
        setCanonicalIdentifier(checkData.identifier)

        // Automatically dispatch OTP to their registered email address
        await api.post('/control-panel/auth/send-otp', {
          identifier: checkData.identifier,
        })

        setStep(2)
        setResendTimer(60)
        setOtpAttempts(0)
        toast.success('High-security account detected! OTP code sent to your email.')
      } else {
        // ── Normal User (Student) standard login ──────────────────────────────
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.')
          setLoading(false)
          return
        }

        const loginRes = await api.post('/auth/login', {
          email: trimmedIdentifier,
          password,
          turnstileToken: captchaToken,
        })

        if (loginRes.data.data.requiresOtp) {
          // Fallback if backend login detected privileged user dynamically
          setIsPrivileged(true)
          setMaskedEmail(loginRes.data.data.maskedEmail)
          setCanonicalIdentifier(loginRes.data.data.identifier)
          setStep(2)
          setResendTimer(60)
          toast.success('OTP sent to your email!')
        } else {
          const { user, token } = loginRes.data.data
          setLockedUntil(null)
          completeAuth(user, token)
        }
      }
    } catch (err) {
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP digit inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)
      otpInputRefs.current[5]?.focus()
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setLoading(true)
    try {
      await api.post('/control-panel/auth/send-otp', {
        identifier: canonicalIdentifier || email,
      })
      setResendTimer(60)
      toast.success('New OTP sent to your email!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP for Authority User
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(null)

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/control-panel/auth/verify-otp', {
        identifier: canonicalIdentifier || email,
        otp: otpString,
      })

      const tokenVal = res.data.data.preAuthToken
      setPreAuthToken(tokenVal)

      // If user already entered password in Step 1, verify password directly!
      if (password && password.length >= 6) {
        const passRes = await api.post('/control-panel/auth/verify-password', {
          preAuthToken: tokenVal,
          password,
        })
        const { user, accessToken } = passRes.data.data
        completeAuth(user, accessToken)
      } else {
        // Prompt for password in Step 3
        setStep(3)
        toast.success('OTP verified! Please enter your password.')
      }
    } catch (err) {
      setOtpAttempts((prev) => prev + 1)
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify Password for Authority User
  const handleVerifyPassword = async (e) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/control-panel/auth/verify-password', {
        preAuthToken,
        password,
      })

      const { user, accessToken } = res.data.data
      completeAuth(user, accessToken)
    } catch (err) {
      setError(err.response?.data?.message || 'Password authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const bg = 'bg-[#f1f5f9]'
  const card = 'bg-white'
  const strip = 'bg-white border-[#E2E8F0]'
  const text = 'text-[#022448]'
  const sub = 'text-slate-500'
  const label = 'text-slate-700 font-medium text-xs sm:text-sm'
  const inp = 'border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent focus:outline-none'

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-[Inter] ${bg}`}
      style={{
        backgroundImage: `radial-gradient(#1E3A5F 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header Strip */}
      <div className={`w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl border ${strip}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src="/sca.png" alt="SCA Logo" className="h-14 sm:h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {step === 1 ? (
            <>
              <span className="text-xs sm:text-sm hidden sm:block text-slate-600">New here?</span>
              <Link
                to="/signup"
                className="bg-primary text-on-primary px-3 sm:px-5 py-1.5 sm:py-2 rounded-btn font-semibold flex items-center gap-1 sm:gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition-all text-xs sm:text-sm"
              >
                Sign Up <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <span className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600" /> Control Panel Gateway
            </span>
          )}
        </div>
      </div>

      {/* Main Card Container */}
      <main className="w-full max-w-[460px] flex flex-col gap-4 sm:gap-6">
        <section className={`rounded-2xl shadow-lg ${card} p-6 sm:p-10 border border-slate-100`}>
          {/* SCA LPU Logo + Title Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <img src="/sca.png" alt="SCA Logo" className="h-20 sm:h-24 w-auto mb-2 sm:mb-3" />
            </Link>
            <h1 className={`text-xl sm:text-2xl font-bold ${text}`}>
              {step === 1 ? 'Welcome Back' : step === 2 ? 'Security Verification' : 'Authority Login'}
            </h1>
            <p className={`text-xs sm:text-sm ${sub} mt-0.5`}>
              {isPrivileged ? 'Secure Authority Gateway · LPU' : 'School of Computer Applications, LPU'}
            </p>
          </div>

          {/* Privileged Stepper Badge (Steps 2 & 3) */}
          {isPrivileged && (
            <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <ShieldCheck size={14} /> Authority User Detected
              </div>
            </div>
          )}

          {/* STEP 1: Universal Login Input */}
          {step === 1 && (
            <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
              {/* Email / Reg No / Employee ID */}
              <div className="flex flex-col gap-1.5">
                <label className={label}>Email, registration number, or employee ID</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" size={18} />
                  <input
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                    placeholder="Email, reg. number, or employee ID"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className={label}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" size={18} />
                  <input
                    className={`w-full pl-9 pr-11 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium hover:underline text-primary">
                  Forgot password?
                </Link>
              </div>

              {/* Security Captcha */}
              <TurnstileWidget ref={recaptchaRef} onChange={setCaptchaToken} theme="light" />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !captchaToken || Boolean(lockedUntil && Date.now() < lockedUntil)}
                className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> Authenticating…</>
                ) : lockedUntil && Date.now() < lockedUntil ? (
                  'Account locked — try later'
                ) : (
                  <><span>Login</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Authority 2FA OTP Code Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 text-center">
              <div>
                <h2 className={`text-lg font-bold ${text} mb-1`}>Enter Security OTP Code</h2>
                <p className="text-xs text-slate-500">
                  Sent to <span className="font-mono text-[#2563EB] font-semibold">{maskedEmail}</span>
                </p>
              </div>

              {/* 6 OTP Inputs */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-10 h-12 text-center text-lg font-bold font-mono rounded-lg border transition-all ${inp}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Timer / Resend OTP */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Attempts: {otpAttempts}/3</span>
                {resendTimer > 0 ? (
                  <span>Resend in <strong className="text-[#2563EB] font-mono">{resendTimer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-50 transition-all text-sm sm:text-base"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Verifying…</>
                  ) : (
                    <><span>Verify OTP Code</span><KeyRound size={16} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setIsPrivileged(false)
                    setError(null)
                  }}
                  className="text-xs text-slate-500 hover:text-[#022448] font-medium transition-colors mt-1"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Authority Password Entry (if not supplied in step 1) */}
          {step === 3 && (
            <form onSubmit={handleVerifyPassword} className="flex flex-col gap-4">
              <div>
                <h2 className={`text-lg font-bold ${text} mb-1`}>Provide Password</h2>
                <p className="text-xs text-slate-500">OTP verified. Enter your password to complete authority login.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={label}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" size={18} />
                  <input
                    className={`w-full pl-9 pr-11 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md mt-1 disabled:opacity-50 transition-all text-sm sm:text-base"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> Authenticating…</>
                ) : (
                  <><span>Complete Authority Login</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            <Link to="/forgot-password" className="font-medium underline text-[#2563EB]">
              Forgot your password?
            </Link>{' '}
            · Need help? Email{' '}
            <a href="mailto:sca@lpu.edu.in" className="font-medium underline text-[#2563EB]">
              sca@lpu.edu.in
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}
