import { useState, useEffect } from 'react'
import { Upload, Edit2, Save, Eye, EyeOff, CheckCircle2, X, Mail, Phone, ShieldCheck, ShieldQuestion } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import { SECURITY_QUESTIONS } from '../auth/ForgotPassword'

const inputCls = 'w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none'

export default function StudentProfile() {
  const { user, setUser } = useAuthStore()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [toast, setToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', personalEmail: '',
    phone: '', program: '', degree: '', semester: '', section: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [secData, setSecData] = useState({ question: '', answer: '', confirmAnswer: '' })
  const [secSaved, setSecSaved] = useState(false)
  const [secLoading, setSecLoading] = useState(false)
  const [showSecAnswer, setShowSecAnswer] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '', lastName: user.lastName || '',
        personalEmail: user.personalEmail || '', phone: user.phone || '',
        program: user.program || '', degree: user.degree || '',
        semester: user.semester || '', section: user.section || ''
      })
      if (user.profilePhotoUrl) setPhotoPreview(user.profilePhotoUrl)
    }
  }, [user])

  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl) }, [photoPreviewUrl])

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Select an image'); e.target.value = ''; return }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); e.target.value = ''; return }
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url); setPhotoPreviewUrl(url)
    setPhotoUploading(true)
    try {
      const form = new FormData(); form.append('profilePhoto', file)
      const res = await api.put('/users/me/profile', form)
      setUser(res.data.data)
      setPhotoPreview(res.data.data.profilePhotoUrl || null)
      URL.revokeObjectURL(url); setPhotoPreviewUrl(null)
    } catch (err) {
      setPhotoPreview(user?.profilePhotoUrl || null)
      alert(err.response?.data?.message || 'Upload failed')
    } finally { setPhotoUploading(false); e.target.value = '' }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const form = new FormData()
      Object.keys(formData).forEach(k => form.append(k, formData[k] ?? ''))
      const res = await api.put('/users/me/profile', form)
      setUser(res.data.data)
      if (res.data.data.profilePhotoUrl) setPhotoPreview(res.data.data.profilePhotoUrl)
      setToast(true); setTimeout(() => setToast(false), 3000)
    } catch (err) { alert(err.response?.data?.message || 'Update failed') }
    finally { setLoading(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password', { newPassword: passwordData.newPassword })
      alert('Password updated!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { alert(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  // Load existing security question on mount
  useEffect(() => {
    api.get('/auth/security-question')
      .then(res => {
        if (res.data?.data?.securityQuestion) {
          setSecData(prev => ({ ...prev, question: res.data.data.securityQuestion }))
        }
      })
      .catch(() => {})
  }, [])

  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    if (!secData.question) { alert('Please select a security question.'); return }
    if (!secData.answer.trim()) { alert('Please enter your answer.'); return }
    if (secData.answer.trim() !== secData.confirmAnswer.trim()) { alert('Answers do not match.'); return }
    setSecLoading(true)
    try {
      await api.post('/auth/security-question', { question: secData.question, answer: secData.answer.trim() })
      setSecSaved(true)
      setSecData(prev => ({ ...prev, answer: '', confirmAnswer: '' }))
      setTimeout(() => setSecSaved(false), 3000)
    } catch (err) { alert(err.response?.data?.message || 'Failed to save security question') }
    finally { setSecLoading(false) }
  }

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

  if (!user) return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">Loading…</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white border-l-4 border-green-500 px-4 py-3 rounded-lg shadow-lg max-w-[90vw]">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-on-surface">Profile updated!</p>
          <button onClick={() => setToast(false)} className="ml-auto text-on-surface-variant"><X size={16} /></button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col lg:flex-row">

          {/* ── Sidebar panel ── */}
          <div className="lg:w-72 bg-primary-container p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-tertiary flex items-center justify-center text-white text-3xl font-bold border-4 border-primary/20 shadow">
                  {initials}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Edit2 size={20} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <h3 className="mt-4 text-base font-bold text-white">{user.firstName} {user.lastName}</h3>
            <span className="mt-1 px-3 py-0.5 bg-tertiary rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              {user.role?.toUpperCase()}
            </span>
            <p className="mt-2 text-xs text-on-primary-container break-all px-1">{user.personalEmail}</p>
            <label className="mt-4 w-full py-2 border border-white/30 text-white rounded-lg text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload size={13} />
              {photoUploading ? 'Uploading…' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            {/* Stats */}
            <div className="mt-auto pt-6 w-full border-t border-white/10 grid grid-cols-2 gap-4 text-left">
              <div><p className="text-white font-bold text-sm">0</p><p className="text-white/60 text-[10px]">Events Joined</p></div>
              <div><p className="text-white font-bold text-sm">0</p><p className="text-white/60 text-[10px]">Tasks Done</p></div>
            </div>
          </div>

          {/* ── Main form area ── */}
          <div className="flex-1 p-5 sm:p-8 space-y-8">

            {/* Personal info form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <Mail size={18} className="text-secondary" /> Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', key: 'firstName', type: 'text' },
                  { label: 'Last Name',  key: 'lastName',  type: 'text' },
                  { label: 'Program',    key: 'program',   type: 'text' },
                  { label: 'Section',    key: 'section',   type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant">{label}</label>
                    <input className={inputCls} type={type} value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Degree</label>
                  <select className={inputCls} value={formData.degree}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}>
                    <option value="">Select</option>
                    {['B.Tech','M.Tech','BCA','MCA'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Semester</label>
                  <select className={inputCls} value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                    <option value="">Select</option>
                    {['1st','2nd','3rd','4th','5th','6th','7th','8th'].map(s => (
                      <option key={s} value={s}>{s} Semester</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <Phone size={18} className="text-secondary" /> Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Personal Email</label>
                  <input className={inputCls} type="email" value={formData.personalEmail}
                    onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" />
                    <input className={`${inputCls} pl-9`} type="tel" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-60">
                  <Save size={15} /> {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Password form */}
            <form onSubmit={handlePasswordSubmit} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-5">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldCheck size={18} className="text-secondary" /> Security & Password
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Current Password', key: 'currentPassword', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { label: '', key: '', show: false, toggle: null }, // spacer
                  { label: 'New Password',      key: 'newPassword',     show: showNew,     toggle: () => setShowNew(v => !v) },
                  { label: 'Confirm Password',  key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                ].map(({ label, key, show, toggle }, i) => (
                  key ? (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-on-surface-variant">{label}</label>
                      <div className="relative">
                        <input
                          className={`${inputCls} pr-10`}
                          type={show ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordData[key]}
                          onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                        />
                        <button type="button" onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                          {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ) : <div key={i} className="hidden sm:block" />
                ))}
              </div>
              <div className="flex justify-start">
                <button type="submit" disabled={loading}
                  className="px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-60">
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>

            {/* Security Question section */}
            <form onSubmit={handleSecuritySubmit} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldQuestion size={18} className="text-secondary" /> Security Question
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This question is used to verify your identity when you forget your password. Keep your answer memorable and private.
              </p>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant">Select a Question</label>
                <select
                  className={inputCls}
                  value={secData.question}
                  onChange={e => setSecData({ ...secData, question: e.target.value })}
                  required
                >
                  <option value="">— Choose a security question —</option>
                  {SECURITY_QUESTIONS.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Your Answer</label>
                  <div className="relative">
                    <input
                      className={`${inputCls} pr-10`}
                      type={showSecAnswer ? 'text' : 'password'}
                      placeholder="Enter your answer"
                      value={secData.answer}
                      onChange={e => setSecData({ ...secData, answer: e.target.value })}
                      autoComplete="off"
                      required
                    />
                    <button type="button" onClick={() => setShowSecAnswer(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      {showSecAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Confirm Answer</label>
                  <input
                    className={inputCls}
                    type="password"
                    placeholder="Re-enter your answer"
                    value={secData.confirmAnswer}
                    onChange={e => setSecData({ ...secData, confirmAnswer: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant">Answer is case-insensitive and stored securely.</p>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={secLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-60">
                  <Save size={14} /> {secLoading ? 'Saving…' : 'Save Question'}
                </button>
                {secSaved && (
                  <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                    <CheckCircle2 size={14} /> Saved!
                  </span>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-outline-variant text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Account Secured
              </span>
              <span>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Today'}</span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
