import { useState, useRef } from 'react'
import { Send, ShieldCheck, CheckCircle2, RefreshCw, Mail } from 'lucide-react'
import api from '../../config/axios'
import PublicLayout from '../../components/layout/PublicLayout'
import RecaptchaWidget from '../../components/ui/RecaptchaWidget'

export default function Contact() {
  const [focusedField, setFocusedField] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaError, setCaptchaError] = useState(false)
  const recaptchaRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '', email: '', universityId: '', role: 'Student',
    category: 'Event Query', subject: '', message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      setCaptchaError(true)
      return
    }
    setCaptchaError(false)
    setIsSubmitting(true)
    try {
      await api.post('/contact', formData)
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', universityId: '', role: 'Student', category: 'Event Query', subject: '', message: '' })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to send query')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      setIsSubmitting(false)
    }
  }

  const inputCls = (field) =>
    `w-full px-4 py-2.5 bg-surface-card rounded-btn border transition-all text-sm focus:outline-none ${
      focusedField === field
        ? 'border-primary ring-2 ring-primary/10'
        : 'border-outline-variant'
    }`

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-[600px] bg-surface-card rounded-card border border-outline-variant shadow-card overflow-hidden">
          {/* Card Header */}
          <div className="p-5 sm:p-6 border-b border-outline-variant">
            <h1 className="text-2xl sm:text-[32px] text-on-surface mb-1 font-bold">Contact Us</h1>
            <p className="text-sm text-on-surface-variant">Have a question or issue? We will get back to you shortly.</p>
          </div>

          {/* Contact Form */}
          <form className="p-5 sm:p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${focusedField === 'name' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Name
                </label>
                <input
                  className={inputCls('name')}
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${focusedField === 'email' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Email
                </label>
                <input
                  className={inputCls('email')}
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${focusedField === 'uid' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  University ID
                </label>
                <div className="relative">
                  <input
                    className={inputCls('uid')}
                    type="text"
                    value={formData.universityId}
                    onChange={e => setFormData({ ...formData, universityId: e.target.value })}
                    onFocus={() => setFocusedField('uid')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={15} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-semibold ${focusedField === 'role' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Role
                </label>
                <select
                  className={inputCls('role')}
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-semibold ${focusedField === 'cat' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Category
              </label>
              <select
                className={inputCls('cat')}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                onFocus={() => setFocusedField('cat')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="Event Query">Event Query</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Registration Dispute">Registration Dispute</option>
                <option value="Feedback">Feedback</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-semibold ${focusedField === 'sub' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Subject
              </label>
              <input
                className={inputCls('sub')}
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                onFocus={() => setFocusedField('sub')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-semibold ${focusedField === 'msg' ? 'text-primary' : 'text-on-surface-variant'}`}>
                Message
              </label>
              <textarea
                className={inputCls('msg')}
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                onFocus={() => setFocusedField('msg')}
                onBlur={() => setFocusedField(null)}
                placeholder="Type your detailed message here..."
                required
              />
            </div>

            {/* reCAPTCHA */}
            <RecaptchaWidget
              ref={recaptchaRef}
              onChange={token => { setCaptchaToken(token); setCaptchaError(false) }}
            />
            {captchaError && (
              <p className="text-red-600 text-xs font-medium -mt-1">
                Please complete the security verification before submitting.
              </p>
            )}

            <button
              className="mt-1 w-full bg-primary text-on-primary font-semibold py-3 rounded-btn transition-all active:scale-[0.98] flex justify-center items-center gap-2 hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting
                ? <><RefreshCw className="animate-spin" size={17} /> Sending…</>
                : isSubmitted
                ? <><CheckCircle2 size={17} /> Message Sent!</>
                : <><Send size={17} /> Submit Query</>
              }
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-on-surface-variant flex flex-wrap items-center justify-center gap-2">
            Or reach us at:
            <a
              className="text-primary font-bold hover:underline underline-offset-4 flex items-center gap-1"
              href="mailto:sca@lpu.edu.in"
            >
              <Mail size={15} /> sca@lpu.edu.in
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
