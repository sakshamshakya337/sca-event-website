import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  ArrowRight,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import TurnstileWidget from '../../components/security/TurnstileWidget'

export default function ControlPanel() {
  // Step state: 1 = Validate Account, 2 = Send OTP Confirmation, 3 = OTP Entry, 4 = Password Entry
  const [step, setStep] = useState(1)

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [canonicalIdentifier, setCanonicalIdentifier] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [preAuthToken, setPreAuthToken] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // UI & Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)

  const recaptchaRef = useRef(null)
  const otpInputRefs = useRef([])
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)

  // Resend OTP countdown timer
  useEffect(() => {
    let timer
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  // Handle Step 1: Account Validation
  const handleValidateAccount = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedId = identifier.trim()
    if (!trimmedId) {
      setError('Please enter your email or employee ID.')
      return
    }
    if (!captchaToken) {
      setError('Please complete the security verification.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/control-panel/auth/validate-account', {
        identifier: trimmedId,
        turnstileToken: captchaToken,
      })

      const data = res.data.data
      setMaskedEmail(data.maskedEmail)
      setCanonicalIdentifier(data.identifier)
      setStep(2)
    } catch (err) {
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      setError(err.response?.data?.message || 'Validation failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 2: Trigger Send OTP
  const handleSendOtp = async () => {
    setError(null)
    setLoading(true)

    try {
      await api.post('/control-panel/auth/send-otp', {
        identifier: canonicalIdentifier || identifier,
      })

      setStep(3)
      setResendTimer(60)
      setOtpAttempts(0)
      toast.success('OTP sent to your email!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP Input handler
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

  // Handle Step 3: Verify OTP
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
        identifier: canonicalIdentifier || identifier,
        otp: otpString,
      })

      setPreAuthToken(res.data.data.preAuthToken)
      setStep(4)
      toast.success('OTP verified!')
    } catch (err) {
      setOtpAttempts((prev) => prev + 1)
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 4: Verify Password & Complete Login
  const handleVerifyPassword = async (e) => {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/control-panel/auth/verify-password', {
        preAuthToken,
        password,
      })

      const { user, accessToken, role } = res.data.data

      loginStore(user, accessToken)
      toast.success('Login successful!')

      const roleRedirectMap = {
        admin: '/admin',
        superadmin: '/superadmin',
        hos: '/hos',
        dean: '/dean',
        hod: '/faculty/approvals',
        faculty_coordinator: '/faculty',
        faculty: '/faculty',
      }


      const destination = roleRedirectMap[role] || '/admin'
      navigate(destination, { replace: true })
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
      {/* Top Header Strip — Identical to Portal.jsx */}
      <div className={`w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 rounded-xl border ${strip}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src="/sca.png" alt="SCA Logo" className="h-14 sm:h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-slate-600 font-medium">
            Control Panel Gateway
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <main className="w-full max-w-[460px] flex flex-col gap-4 sm:gap-6">
        <section className={`rounded-2xl shadow-lg ${card} p-6 sm:p-10 border border-slate-100`}>
          {/* SCA LPU Logo + Heading */}
          <div className="flex flex-col items-center text-center gap-2 mb-6 sm:mb-8">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <img src="/sca.png" alt="SCA Logo" className="h-20 sm:h-24 w-auto mb-2 sm:mb-3" />
            </Link>
            <h1 className={`text-xl sm:text-2xl font-bold ${text}`}>Control Panel Login</h1>
            <p className={`text-xs sm:text-sm ${sub} mt-0.5`}>School of Computer Applications, LPU</p>
          </div>

          {/* Stepper Dots / Badges */}
          <div className="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-slate-100">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === s
                      ? 'bg-primary text-on-primary shadow-sm ring-2 ring-blue-200'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                {s < 4 && <div className={`h-0.5 w-6 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {/* STEP 1: Account Validation */}
          {step === 1 && (
            <form onSubmit={handleValidateAccount} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={label}>Email or employee ID</label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" size={18} />
                  <input
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm transition-all ${inp}`}
                    placeholder="Enter email or employee ID"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <TurnstileWidget ref={recaptchaRef} onChange={setCaptchaToken} theme="light" />

              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> Validating…</>
                ) : (
                  <><span>Validate Account</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Send OTP Dispatch */}
          {step === 2 && (
            <div className="flex flex-col gap-5 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-[#022448] flex items-center justify-center mx-auto">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h2 className={`text-lg font-bold ${text} mb-1`}>Account Verified</h2>
                <p className="text-xs text-slate-500">
                  Registered Email: <span className="font-mono text-[#2563EB] font-semibold">{maskedEmail}</span>
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Click below to send a secure 5-minute One-Time Password (OTP) to your email.
              </p>

              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-50 transition-all text-sm sm:text-base"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Sending OTP…</>
                  ) : (
                    <><span>Send OTP Code</span><ArrowRight size={16} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-[#022448] font-medium transition-colors"
                >
                  Use a different account
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP Entry */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 text-center">
              <div>
                <h2 className={`text-lg font-bold ${text} mb-1`}>Enter OTP Code</h2>
                <p className="text-xs text-slate-500">
                  Sent to <span className="font-mono text-[#2563EB]">{maskedEmail}</span>
                </p>
              </div>

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
                  />
                ))}
              </div>

              {error && (
                <div className="border-l-4 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 border-l-red-500 text-red-700 flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Attempts: {otpAttempts}/3</span>
                {resendTimer > 0 ? (
                  <span>Resend in <strong className="text-[#2563EB] font-mono">{resendTimer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 font-semibold rounded-btn flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-50 transition-all text-sm sm:text-base"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> Verifying…</>
                ) : (
                  <><span>Verify OTP</span><KeyRound size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Password Entry */}
          {step === 4 && (
            <form onSubmit={handleVerifyPassword} className="flex flex-col gap-4">
              <div>
                <h2 className={`text-lg font-bold ${text} mb-1`}>Enter Password</h2>
                <p className="text-xs text-slate-500">Provide your password to access the control panel.</p>
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
                  <><span>Login to Control Panel</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Footer Note */}
        <footer className="text-center px-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Authorized administrative entry for School of Computer Applications, LPU.
          </p>
        </footer>
      </main>
    </div>
  )
}
