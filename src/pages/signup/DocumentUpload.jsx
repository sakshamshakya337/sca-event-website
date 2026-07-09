import { useCallback, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CloudUpload, X, FileText, CheckCircle2, ArrowRight,
  RotateCw, Clock, Mail, ShieldCheck, PartyPopper,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import useSignupStore from '../../store/signupStore'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import RecaptchaWidget from '../../components/ui/RecaptchaWidget'

// ── Shared nav / footer shells ─────────────────────────────────────────────
function TopNav() {
  return (
    <nav className="fixed top-0 w-full h-[60px] z-50 bg-white border-b border-[#c4c6cf] flex justify-between items-center px-6">
      <div className="flex items-center gap-2">
        <img src="/sca.png" alt="SCA Logo" className="h-14 w-auto" />
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <Link
          to="/portal"
          className="bg-primary text-on-primary px-5 py-2 rounded-btn text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}

function PageFooter() {
  return (
    <footer className="w-full py-4 mt-auto bg-[#f0f4f8] border-t border-[#c4c6cf] px-6 flex flex-col md:flex-row justify-between items-center gap-2">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <img src="/sca.png" alt="SCA Logo" className="h-11 w-auto" />
        <div className="flex flex-col">
          <span className="text-sm text-[#43474e] text-center md:text-left">
            © 2026 School of Computer Application. Institutional Event Management System.
          </span>
          <span className="text-xs text-[#43474e] text-center md:text-left mt-1">
            Developed and maintained by —{' '}
            <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-[#0051d5] hover:underline">
              Saksham Shakya
            </a>
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Privacy Policy</a>
        <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Terms of Service</a>
        <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Support</a>
      </div>
    </footer>
  )
}

// ── Approval pending screen ────────────────────────────────────────────────
function ApprovalPending({ userInfo }) {
  return (
    <div className="bg-[#f6fafe] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      <TopNav />

      <main className="mt-[60px] flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px]">

          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">

            {/* Gradient top bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#1E3A5F] to-[#B45309]" />

            <div className="px-8 py-10 text-center">

              {/* Animated icon stack */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-30" />
                <div className="relative w-24 h-24 bg-amber-50 border-4 border-amber-200 rounded-full flex items-center justify-center">
                  <Clock className="text-amber-500" size={40} />
                </div>
              </div>

              {/* Logo */}
              <img src="/sca.png" alt="SCA" className="h-12 w-auto mx-auto mb-5 opacity-80" />

              <h1 className="text-2xl font-bold text-[#022448] mb-2">
                Registration Complete!
              </h1>
              <p className="text-sm text-slate-500 mb-1 leading-relaxed">
                Hi <strong className="text-[#022448]">{userInfo?.firstName}</strong>, your application has been submitted successfully.
              </p>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Your account is now pending administrator approval.
              </p>

              {/* What happens next */}
              <div className="text-left bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5 mb-6 space-y-4">
                <p className="text-xs font-bold text-[#022448] uppercase tracking-widest mb-3">
                  What happens next
                </p>
                {[
                  { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Application submitted', sub: 'Your documents have been uploaded securely.' },
                  { icon: ShieldCheck,  color: 'text-amber-600 bg-amber-50',    label: 'Admin reviews documents', sub: 'Typically takes 24–48 hours.' },
                  { icon: PartyPopper, color: 'text-blue-600 bg-blue-50',       label: 'Account activated',     sub: "You'll get an email when you're approved." },
                ].map(({ icon: Icon, color, label, sub }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#022448]">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-7">
                <Mail size={14} className="shrink-0" />
                <span>Questions? Email us at</span>
                <a href="mailto:sca@lpu.edu.in" className="text-primary font-semibold hover:underline">
                  sca@lpu.edu.in
                </a>
              </div>

              {/* CTA */}
              <Link
                to="/"
                className="w-full py-3.5 px-6 bg-primary text-on-primary font-semibold rounded-btn hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-md"
              >
                Go to Home Page
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* Gradient bottom bar */}
            <div className="h-1 bg-gradient-to-r from-[#1E3A5F] to-[#B45309]" />
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            SCA Institutional Portal © 2026 · Lovely Professional University
          </p>
        </div>
      </main>

      <PageFooter />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DocumentUpload() {
  const navigate = useNavigate()
  const { role, details, setDocuments, resetSignup } = useSignupStore()
  const { login: setAuthState } = useAuthStore()

  // ALL hooks must be declared before any conditional return
  const [universityId, setUniversityId]     = useState(null)
  const [profilePhoto, setProfilePhoto]     = useState(null)
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [error, setError]                   = useState(null)
  const [captchaToken, setCaptchaToken]     = useState(null)
  const [submitted, setSubmitted]           = useState(false)
  const [submittedUser, setSubmittedUser]   = useState(null)
  const recaptchaRef = useRef(null)

  // Guard: if no signup data in store, redirect to /signup
  // This is done in useEffect (not inline) to avoid hooks-order violation
  useEffect(() => {
    if (!role || !details?.firstName) {
      resetSignup()
      navigate('/signup', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onDropUniversityId = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUniversityId({ file, preview: URL.createObjectURL(file) })
    }
  }, [])

  const onDropProfilePhoto = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setProfilePhoto({ file, preview: URL.createObjectURL(file) })
    }
  }, [])

  const { getRootProps: getIdRootProps, getInputProps: getIdInputProps, isDragActive: isIdDragActive } = useDropzone({
    onDrop: onDropUniversityId,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps, isDragActive: isPhotoDragActive } = useDropzone({
    onDrop: onDropProfilePhoto,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!universityId || !profilePhoto) return
    if (!captchaToken) {
      setError('Please complete the security verification before submitting.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    let createdToken = null

    try {
      // Step 1 — create the account
      const signupRes = await api.post('/auth/signup', { role, ...details })
      const { user, token } = signupRes.data.data
      createdToken = token

      // Step 2 — authenticate so the verification request is authorized
      setAuthState(user, token)

      // Step 3 — upload documents to Cloudinary via verification endpoint
      const formData = new FormData()
      formData.append('universityId', universityId.file)
      formData.append('profilePhoto', profilePhoto.file)
      await api.post('/verification', formData)

      // Step 4 — cleanup
      if (universityId?.preview) URL.revokeObjectURL(universityId.preview)
      if (profilePhoto?.preview) URL.revokeObjectURL(profilePhoto.preview)
      setDocuments({ universityId, profilePhoto })
      resetSignup()

      // Step 5 — show the approval pending screen (in-page, no redirect)
      setSubmittedUser(user)
      setSubmitted(true)
    } catch (err) {
      console.error('Signup/verification error:', err)

      // If signup succeeded but verification upload failed, roll back the account
      // so the user can retry cleanly (avoids "duplicate user" error on retry)
      if (createdToken) {
        try {
          await api.delete('/auth/me', {
            headers: { Authorization: `Bearer ${createdToken}` },
          })
        } catch { /* best-effort */ }
        setAuthState(null, null)
      }

      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeUniversityId = () => {
    if (universityId?.preview) URL.revokeObjectURL(universityId.preview)
    setUniversityId(null)
  }

  const removeProfilePhoto = () => {
    if (profilePhoto?.preview) URL.revokeObjectURL(profilePhoto.preview)
    setProfilePhoto(null)
  }

  // Show approval pending screen after successful submission
  if (submitted) {
    return <ApprovalPending userInfo={submittedUser} />
  }

  // If store is empty, render nothing while useEffect redirects
  if (!role || !details?.firstName) return null

  return (
    <div className="bg-[#f6fafe] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      <TopNav />

      {/* Main Content */}
      <main className="mt-[60px] flex-grow flex flex-col items-center py-6 px-6">

        {/* Progress steps */}
        <div className="w-full max-w-3xl mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#c4c6cf] -z-10 -translate-y-1/2" />
            {[
              { label: 'Account Info',     done: true,  active: false },
              { label: 'Personal Details', done: true,  active: false },
              { label: 'Verification',     done: false, active: true  },
            ].map(({ label, done, active }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-[#f6fafe] px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  done   ? 'bg-[#10b981] text-white' :
                  active ? 'bg-[#022448] text-white ring-4 ring-[#022448]/10' :
                           'bg-white border-2 border-[#c4c6cf] text-[#74777f]'
                }`}>
                  {done ? <CheckCircle2 size={20} /> : <span className="text-sm font-semibold">{i + 1}</span>}
                </div>
                <span className={`text-sm ${active ? 'font-semibold text-[#022448]' : 'text-[#43474e]'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — upload area */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-[#022448] mb-2">Upload Documents</h1>
              <p className="text-sm text-[#43474e] mb-6">
                Your identification documents will be securely stored and attached to your profile.
              </p>

              <div className="flex flex-col gap-4">
                {/* University ID */}
                {universityId ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ecfdf5] border border-emerald-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 bg-white flex items-center justify-center">
                        {universityId.file.type.includes('image')
                          ? <img src={universityId.preview} alt="ID preview" className="w-full h-full object-cover" />
                          : <FileText size={24} className="text-emerald-600" />
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] text-emerald-900">{universityId.file.name}</span>
                        <span className="text-sm text-emerald-700">
                          {(universityId.file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to submit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <button type="button" onClick={removeUniversityId} className="text-emerald-800 hover:bg-emerald-200/50 p-2 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#171c1f]">University ID Card</p>
                    <div
                      {...getIdRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isIdDragActive ? 'border-[#0051d5] bg-[#0051d5]/5' : 'border-[#c4c6cf] hover:border-[#0051d5] hover:bg-[#f0f4f8]'
                      }`}
                    >
                      <input {...getIdInputProps()} />
                      <CloudUpload size={40} className="mx-auto text-[#74777f] mb-4" />
                      <p className="text-[#43474e] mb-2">{isIdDragActive ? 'Drop the file here...' : 'Click or drag file to upload'}</p>
                      <p className="text-xs text-[#74777f]">PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}

                {/* Profile photo */}
                {profilePhoto ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ecfdf5] border border-emerald-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 bg-white">
                        <img src={profilePhoto.preview} alt="Photo preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] text-emerald-900">{profilePhoto.file.name}</span>
                        <span className="text-sm text-emerald-700">
                          {(profilePhoto.file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to submit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <button type="button" onClick={removeProfilePhoto} className="text-emerald-800 hover:bg-emerald-200/50 p-2 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#171c1f]">Profile Photo</p>
                    <div
                      {...getPhotoRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isPhotoDragActive ? 'border-[#0051d5] bg-[#0051d5]/5' : 'border-[#c4c6cf] hover:border-[#0051d5] hover:bg-[#f0f4f8]'
                      }`}
                    >
                      <input {...getPhotoInputProps()} />
                      <CloudUpload size={40} className="mx-auto text-[#74777f] mb-4" />
                      <p className="text-[#43474e] mb-2">{isPhotoDragActive ? 'Drop the image here...' : 'Click or drag image to upload'}</p>
                      <p className="text-xs text-[#74777f]">PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* reCAPTCHA */}
              <div className="mt-6">
                <RecaptchaWidget ref={recaptchaRef} onChange={setCaptchaToken} />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!universityId || !profilePhoto || !captchaToken || isSubmitting}
                className="w-full mt-8 bg-primary text-on-primary py-4 rounded-btn text-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><RotateCw size={20} className="animate-spin" /> Processing…</>
                ) : (
                  <>Complete Registration <ArrowRight size={20} /></>
                )}
              </button>
              <p className="text-center text-sm text-[#43474e] mt-4">
                By clicking complete, you agree to our verification terms.
              </p>
            </div>
          </div>

          {/* Right — profile summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8fafc] border border-[#c4c6cf] rounded-xl p-6 sticky top-[84px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#022448]">Profile Summary</h2>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-[#43474e] hover:text-[#0051d5] flex items-center gap-1 text-sm"
                >
                  <ArrowLeft size={16} /> Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-[#c4c6cf] pb-3">
                  <span className="text-[#43474e] text-sm uppercase tracking-wider">Full Name</span>
                  <span className="text-sm font-semibold text-[#022448]">{details.firstName} {details.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-[#c4c6cf] pb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#43474e] text-sm uppercase tracking-wider">Institutional Role</span>
                    <span className="text-sm font-semibold text-[#022448] capitalize">{role}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[#43474e] text-sm uppercase tracking-wider">
                      {role === 'student' ? 'Reg. Number' : 'Employee ID'}
                    </span>
                    <span className="text-xs font-['JetBrains_Mono'] bg-[#e4e9ed] px-2 py-0.5 rounded text-[#022448]">
                      {role === 'student' ? details.registrationNumber : details.employeeId}
                    </span>
                  </div>
                </div>
                {role === 'student' && (
                  <div className="flex flex-col gap-1 border-b border-[#c4c6cf] pb-3">
                    <span className="text-[#43474e] text-sm uppercase tracking-wider">Academic Program</span>
                    <span className="text-sm font-semibold text-[#022448]">
                      {details.degree} {details.program} — {details.semester} Semester
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-[#43474e] text-sm uppercase tracking-wider">Email</span>
                  <span className="text-sm font-semibold text-[#022448]">{details.personalEmail}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#1e3a5f]/10 rounded-lg border border-[#1e3a5f]/20 flex gap-3">
                <Clock size={20} className="text-[#1e3a5f] shrink-0 mt-0.5" />
                <p className="text-sm text-[#1e3a5f]">
                  Verification typically takes 24–48 hours. You will receive an email confirmation once your account is active.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <PageFooter />
    </div>
  )
}
