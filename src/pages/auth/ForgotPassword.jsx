import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ShieldQuestion, Eye, EyeOff,
  CheckCircle2, Loader2, KeyRound, AlertCircle,
} from 'lucide-react'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import RecaptchaWidget from '../../components/ui/RecaptchaWidget'

// ── Progress step indicator ──────────────────────────────────────────────────
function StepDot({ num, label, active, done }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-200 ${
        done  ? 'bg-green-500 border-green-500 text-white' :
        active ? 'bg-primary border-primary text-white' :
                 'bg-white border-[#c4c6cf] text-[#74777f]'
      }`}>
        {done ? <CheckCircle2 size={17} /> : num}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap ${
        done ? 'text-green-600' : active ? 'text-primary' : 'text-[#74777f]'
      }`}>{label}</span>
    </div>
  )
}

function Connector({ filled }) {
  return <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors duration-300 ${filled ? 'bg-green-500' : 'bg-[#e4e9ed]'}`} />
}

// ── Shared input class ───────────────────────────────────────────────────────
const inp = 'w-full px-4 py-2.5 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg text-sm text-[#171c1f] placeholder-[#aab0ba] focus:ring-2 focus:ring-primary/25 focus:border-primary outline-none transition-all'

// ── Error banner ─────────────────────────────────────────────────────────────
function ErrorBox({ msg }) {
  if (!msg) return null
  return (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-700 px-3 py-2.5 rounded-lg text-sm">
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /* step 1 */
  const [role, setRole] = useState('student')
  const [identifier, setIdentifier] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState(null)
  const [fetchingQ, setFetchingQ] = useState(false)
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [step1Loading, setStep1Loading] = useState(false)

  /* step 2 */
  const [resetToken, setResetToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

  /* step 3 */
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step3Loading, setStep3Loading] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  /* shared */
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [hcaptchaToken, setHcaptchaToken] = useState(null)
  const captchaRef = useRef(null)

  // On mount: if URL contains ?token=...&step=3 (from the email link),
  // jump straight to step 3 so the user can set their new password.
  useEffect(() => {
    const urlToken = searchParams.get('token')
    const urlStep  = searchParams.get('step')
    if (urlToken && urlStep === '3') {
      setResetToken(urlToken)
      setStep(3)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch security question when user leaves the ID field
  const abortControllerRef = useRef(null)

  const handleIdBlur = async () => {
    const id = identifier.trim().toUpperCase()
    if (id.length < 2) return
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    setFetchingQ(true)
    setSecurityQuestion(null)
    try {
      const res = await api.post('/auth/get-security-question', { identifier: id, role }, {
        signal: abortControllerRef.current.signal
      })
      setSecurityQuestion(res.data?.data?.securityQuestion || null)
    } catch (err) { 
      if (err.name === 'CanceledError') return; // Ignore abort errors from axios
      /* silently ignore other errors */ 
    }
    finally { setFetchingQ(false) }
  }

  // Step 1 — verify identity, security answer AND send email from backend
  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    if (!identifier.trim()) return setError('Please enter your ID.')
    if (!securityAnswer.trim()) return setError('Please answer the security question.')
    if (!hcaptchaToken) return setError('Please complete the captcha verification.')
    setStep1Loading(true)
    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim().toUpperCase(),
        role,
        securityAnswer: securityAnswer.trim(),
        hcaptchaToken,
      })
      const { maskedEmail } = res.data.data
      setUserInfo({ maskedEmail })
      setStep(2)
      toast.success('Reset email sent! Check your inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Check your details.')
      // Captcha is single-use — reset it so the user can solve a fresh one.
      captchaRef.current?.reset()
      setHcaptchaToken(null)
    } finally { setStep1Loading(false) }
  }

  // Step 3 — set new password
  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.')
    setStep3Loading(true)
    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword })
      setResetDone(true)
      toast.success('Password reset! You can now log in.')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired — start again.')
    } finally { setStep3Loading(false) }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-[Inter] bg-[#f1f5f9]"
      style={{ backgroundImage: 'radial-gradient(#1E3A5F 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {/* Back link */}
      <div className="w-full max-w-[500px] mb-3">
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Back to Login
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-[#c4c6cf] shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#f0f4f8] text-center">
          <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldQuestion className="text-primary" size={22} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#022448]">Reset Your Password</h1>
          <p className="text-xs sm:text-sm text-[#74777f] mt-1 leading-relaxed">
            Verify your identity and we'll help you set a new password.
          </p>
        </div>

        {/* Step indicator */}
        <div className="px-6 sm:px-10 pt-4 pb-2 flex items-center">
          <StepDot num="1" label="Verify"  active={step === 1} done={step > 1} />
          <Connector filled={step > 1} />
          <StepDot num="2" label="Email"   active={step === 2} done={step > 2} />
          <Connector filled={step > 2} />
          <StepDot num="3" label="Reset"   active={step === 3} done={resetDone} />
        </div>

        {/* ─────────────────────────────────────────────
            STEP 1 — Verify identity (no captcha)
        ───────────────────────────────────────────── */}
        {step === 1 && (
          <form className="px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-4" onSubmit={handleVerify}>

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#74777f] uppercase tracking-widest">I am a</label>
              <div className="flex gap-2">
                {['student', 'faculty'].map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => { setRole(r); setIdentifier(''); setSecurityQuestion(null) }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-[0.98] ${
                      role === r
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-[#c4c6cf] text-[#43474e] hover:border-primary/40'
                    }`}
                  >
                    {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                  </button>
                ))}
              </div>
            </div>

            {/* ID field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#171c1f]">
                {role === 'student' ? 'Registration Number' : 'Employee ID'}
              </label>
              <input
                className={`${inp} tracking-wider uppercase`}
                placeholder={role === 'student' ? 'e.g. 1250000' : 'e.g. EMP12345'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onBlur={handleIdBlur}
                autoCapitalize="characters"
                required
              />
              {fetchingQ && (
                <p className="text-xs text-[#74777f] flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin text-primary" />
                  Looking up account…
                </p>
              )}
            </div>

            {/* Security question + answer */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#171c1f]">Security Question</label>

              {securityQuestion ? (
                <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5">
                  <ShieldQuestion size={15} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-primary font-medium leading-snug">{securityQuestion}</p>
                </div>
              ) : (
                <p className="text-xs text-[#74777f] italic bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5">
                  {identifier.trim().length >= 2
                    ? 'No security question found. Make sure you have set one in your profile.'
                    : `Enter your ${role === 'student' ? 'registration number' : 'employee ID'} above to see your question.`}
                </p>
              )}

              <div className="relative">
                <input
                  className={inp}
                  placeholder="Your answer (case-insensitive)"
                  type={showAnswer ? 'text' : 'password'}
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button type="button" onClick={() => setShowAnswer(!showAnswer)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors">
                  {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <ErrorBox msg={error} />

            <RecaptchaWidget
              ref={captchaRef}
              onChange={setHcaptchaToken}
              className="mb-1"
            />

            <button
              type="submit" disabled={step1Loading || !hcaptchaToken}
              className="w-full py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {step1Loading
                ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
                : 'Verify Identity →'
              }
            </button>

            <p className="text-center text-xs text-[#74777f]">
              Don't have a security question?{' '}
              <span className="text-primary font-medium">Set one in your profile settings first.</span>
            </p>
          </form>
        )}

        {/* ─────────────────────────────────────────────
            STEP 2 — Check Email Screen
        ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-5 sm:px-8 py-8 sm:py-10 flex flex-col gap-4 text-center">
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[#022448]">Check your inbox</h2>
            
            <p className="text-sm text-[#43474e] mt-1 leading-relaxed">
              We've sent a secure reset link to your email:<br/>
              <strong className="text-primary tracking-wide text-base">{userInfo?.maskedEmail}</strong>
            </p>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mt-4 text-xs text-[#74777f] text-left space-y-2">
              <p>• The link is valid for <strong>15 minutes</strong> only.</p>
              <p>• Click the link in the email to set your new password.</p>
              <p>• If you don't see it, be sure to check your spam/junk folder.</p>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────
            STEP 3 — Set new password
        ───────────────────────────────────────────── */}
        {step === 3 && !resetDone && (
          <form className="px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-4" onSubmit={handleReset}>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
              <strong>🔑 You're almost there!</strong> Enter your new password below. This reset link expires in 15 minutes.
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#171c1f]">New Password</label>
              <div className="relative">
                <input className={inp} placeholder="Min. 8 characters"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  required autoComplete="new-password" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && (
                <div className="flex gap-1 h-1 mt-0.5">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`flex-1 rounded-full transition-colors ${
                      newPassword.length >= n * 3
                        ? newPassword.length >= 12 ? 'bg-green-500'
                          : newPassword.length >= 8 ? 'bg-amber-500' : 'bg-red-400'
                        : 'bg-[#e4e9ed]'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#171c1f]">Confirm Password</label>
              <div className="relative">
                <input className={inp} placeholder="Repeat new password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs font-medium ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <ErrorBox msg={error} />

            <button type="submit" disabled={step3Loading}
              className="w-full py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 shadow-md transition-all"
            >
              {step3Loading
                ? <><Loader2 size={15} className="animate-spin" /> Resetting…</>
                : <><KeyRound size={15} /> Reset Password</>
              }
            </button>
          </form>
        )}

        {/* ─────────────────────────────────────────────
            SUCCESS
        ───────────────────────────────────────────── */}
        {resetDone && (
          <div className="px-5 sm:px-8 py-8 sm:py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#022448]">Password Reset!</h2>
              <p className="text-sm text-[#43474e] mt-2 leading-relaxed max-w-xs">
                Your password has been updated. You can now log in with your new credentials.
              </p>
            </div>
            <button
              onClick={() => navigate('/portal')}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 shadow-md active:scale-[0.98] transition-all"
            >
              Go to Login →
            </button>
          </div>
        )}

      </div>

      {/* Support */}
      <p className="mt-5 text-xs text-white/50 text-center">
        Need help?{' '}
        <a href="mailto:sca@lpu.edu.in" className="underline hover:text-white/80 transition-colors">sca@lpu.edu.in</a>
      </p>
    </div>
  )
}
