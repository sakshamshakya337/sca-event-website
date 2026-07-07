import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import {
  CheckCircle2, X, Edit2, Upload, ShieldAlert,
  Mail, Phone, Save, ShieldCheck, Eye, EyeOff, ShieldQuestion,
} from 'lucide-react'
import { SECURITY_QUESTIONS } from '../../config/constants'

const inputCls = 'w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none'

export default function FacultyProfile() {
  const { user, setUser } = useAuthStore()
  const [showToast, setShowToast] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoPreviewObjectUrl, setPhotoPreviewObjectUrl] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', personalEmail: '', phone: '',
    department: '', designation: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  // Security question state
  const [secData, setSecData] = useState({ question: '', answer: '', confirmAnswer: '' })
  const [secSaved, setSecSaved] = useState(false)
  const [secLoading, setSecLoading] = useState(false)
  const [showSecAnswer, setShowSecAnswer] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '', lastName: user.lastName || '',
        personalEmail: user.personalEmail || '', phone: user.phone || '',
        department: user.department || '', designation: user.designation || '',
        coordinatorRole: user.coordinatorRole || ''
      })
      if (user.profilePhotoUrl) setPhotoPreview(user.profilePhotoUrl)
    }
  }, [user])

  useEffect(() => {
    return () => { if (photoPreviewObjectUrl) URL.revokeObjectURL(photoPreviewObjectUrl) }
  }, [photoPreviewObjectUrl])

  // Load existing security question
  useEffect(() => {
    api.get('/auth/security-question')
      .then(res => {
        if (res.data?.data?.securityQuestion) {
          setSecData(prev => ({ ...prev, question: res.data.data.securityQuestion }))
        }
      })
      .catch(() => {})
  }, [])

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); e.target.value = ''; return }
    if (file.size > 5 * 1024 * 1024) { alert('Profile photo must be under 5MB'); e.target.value = ''; return }
    if (photoPreviewObjectUrl) URL.revokeObjectURL(photoPreviewObjectUrl)
    const objectUrl = URL.createObjectURL(file)
    setProfilePhoto(file); setPhotoPreviewObjectUrl(objectUrl); setPhotoPreview(objectUrl)
    setPhotoUploading(true)
    try {
      const form = new FormData(); form.append('profilePhoto', file)
      const res = await api.put('/users/me/profile', form)
      const updatedUser = res.data.data
      setUser(updatedUser); setProfilePhoto(null)
      setPhotoPreview(updatedUser.profilePhotoUrl || null)
      URL.revokeObjectURL(objectUrl); setPhotoPreviewObjectUrl(null)
    } catch (err) {
      setPhotoPreview(user?.profilePhotoUrl || null)
      alert(err.response?.data?.message || 'Failed to upload profile photo')
    } finally { setPhotoUploading(false); e.target.value = '' }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const form = new FormData()
      Object.keys(formData).forEach(key => form.append(key, formData[key] ?? ''))
      if (profilePhoto) form.append('profilePhoto', profilePhoto)
      const res = await api.put('/users/me/profile', form)
      const updatedUser = res.data.data
      setUser(updatedUser); setProfilePhoto(null)
      if (updatedUser.profilePhotoUrl) setPhotoPreview(updatedUser.profilePhotoUrl)
      setShowToast(true); setTimeout(() => setShowToast(false), 3000)
    } catch (err) { alert(err.response?.data?.message || 'Failed to update profile') }
    finally { setLoading(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/change-password', { newPassword: passwordData.newPassword })
      alert('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { alert(err.response?.data?.message || 'Failed to update password') }
    finally { setLoading(false) }
  }

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

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white border-l-4 border-green-500 px-4 py-3 rounded-lg shadow-lg max-w-[90vw]">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
          <div>
            <p className="font-semibold text-on-surface">Profile updated successfully!</p>
            <p className="text-sm text-on-surface-variant">Changes saved to your account.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-auto text-on-surface-variant">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col lg:flex-row">

          {/* ── Sidebar ── */}
          <div className="lg:w-80 bg-primary-container p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-tertiary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-primary/20 shadow-lg">
                  {getInitials()}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Edit2 className="text-white" size={22} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <h3 className="mt-4 sm:mt-6 text-base sm:text-headline-lg text-white font-bold">
              {user.firstName} {user.lastName}
            </h3>
            <div className="mt-2 inline-flex px-3 py-1 bg-tertiary rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
              {user.role?.toUpperCase()}
            </div>
            <p className="mt-3 text-xs text-on-primary-container break-all px-2">
              {user.personalEmail || user.officialEmail}
            </p>
            <p className="mt-1 text-xs text-primary-container/60">
              Member since {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'August 2023'}
            </p>
            <label className="mt-6 w-full py-2.5 border border-white/30 text-white rounded-lg text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={14} />
              {photoUploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            <div className="mt-auto pt-8 w-full border-t border-white/10 grid grid-cols-2 gap-4 text-left">
              <div><p className="text-white font-bold text-sm">0</p><p className="text-white/60 text-[10px]">Events Created</p></div>
              <div><p className="text-white font-bold text-sm">0</p><p className="text-white/60 text-[10px]">Tasks Assigned</p></div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 p-5 sm:p-8 space-y-8">

            {/* Professional info */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldAlert size={18} className="text-secondary" /> Professional Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">First Name</label>
                  <input className={inputCls} type="text" value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Last Name</label>
                  <input className={inputCls} type="text" value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Department</label>
                  <select className={inputCls} value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}>
                    <option value="">Select Department</option>
                    <option value="School of Computer Applications">School of Computer Applications</option>
                    <option value="School of Business">School of Business</option>
                    <option value="School of Engineering">School of Engineering</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Designation</label>
                  <select className={inputCls} value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}>
                    <option value="">Select Designation</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-variant">Coordinator Role</label>
                  <select className={inputCls} value={formData.coordinatorRole || ''}
                    onChange={e => setFormData({ ...formData, coordinatorRole: e.target.value })}>
                    <option value="">None / Select Role</option>
                    <option value="Cultural Coordinator">Cultural Coordinator</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Project Coordinator">Project Coordinator</option>
                    <option value="Sports Coordinator">Sports Coordinator</option>
                    <option value="Technical Coordinator">Technical Coordinator</option>
                  </select>
                </div>
              </div>

              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <Mail size={18} className="text-secondary" /> Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Personal Email</label>
                  <input className={inputCls} type="email" value={formData.personalEmail}
                    onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" />
                    <input className={`${inputCls} pl-9`} type="tel" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                  <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Password */}
            <form onSubmit={handlePasswordSubmit} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-5">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldCheck size={18} className="text-secondary" /> Security & Password
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Current Password</label>
                  <div className="relative">
                    <input className={`${inputCls} pr-10`} placeholder="••••••••"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowCurrentPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block" />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">New Password</label>
                  <div className="relative">
                    <input className={`${inputCls} pr-10`} placeholder="Enter new password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant">Confirm New Password</label>
                  <div className="relative">
                    <input className={`${inputCls} pr-10`} placeholder="Repeat new password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-start">
                <button type="submit" disabled={loading}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

            {/* ── Security Question ── */}
            <form onSubmit={handleSecuritySubmit} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
              <h4 className="text-base font-bold text-primary flex items-center gap-2">
                <ShieldQuestion size={18} className="text-secondary" /> Security Question
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Used to verify your identity when you forget your password. Choose something only you know.
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
              <p className="text-[11px] text-on-surface-variant">Answer is case-insensitive and stored securely as a hash.</p>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={secLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                  <Save size={14} /> {secLoading ? 'Saving…' : 'Save Question'}
                </button>
                {secSaved && (
                  <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                    <CheckCircle2 size={14} /> Saved successfully!
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
