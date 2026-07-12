import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Key, Lock, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'

export default function ForcePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const res = await api.post('/auth/change-password', { newPassword })
      const { user: updatedUser, token } = res.data.data
      login(updatedUser, token)
      toast.success('Password updated successfully!')
      const map = {
        student:             '/student',
        club_president:      '/student',
        club_vice_president: '/student',
        faculty:             '/faculty',
        faculty_coordinator: '/faculty',
        admin:               '/admin',
        dean:                '/dean',
        hos:                 '/hos',
        superadmin:          '/superadmin',
      }
      navigate(map[updatedUser.role] || '/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getStrength = (pwd) => {
    let s = 0
    if (pwd.length > 6) s += 20
    if (pwd.length > 10) s += 20
    if (/[A-Z]/.test(pwd)) s += 20
    if (/[0-9]/.test(pwd)) s += 20
    if (/[^A-Za-z0-9]/.test(pwd)) s += 20
    return s
  }
  const strength = getStrength(newPassword)
  const strengthColor = strength < 40 ? 'bg-red-500' : strength < 70 ? 'bg-amber-500' : 'bg-green-500'
  const strengthText  = strength < 40 ? 'Weak' : strength < 70 ? 'Medium' : 'Strong'
  const strengthHint  = strength < 40 ? 'Add uppercase, lowercase, and numbers' : strength < 70 ? 'Add a special character to make it strong' : 'Your password is strong'

  const inputCls = 'w-full px-4 py-2.5 sm:py-3 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all text-sm text-[#171c1f]'

  return (
    <div className="min-h-screen bg-[#f6fafe] font-[Inter] text-[#171c1f] antialiased flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-xl border border-[#c4c6cf] shadow-lg overflow-hidden">

        {/* Header */}
        <div className="p-5 sm:p-6 text-center flex flex-col items-center gap-2 border-b border-[#c4c6cf]/30">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center mb-1">
            <AlertTriangle className="text-amber-600" size={28} />
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-[#022448]">Set Your New Password</h1>
          <p className="text-xs sm:text-sm text-[#43474e] px-2 sm:px-4 leading-relaxed">
            As a new user, you must replace your temporary credentials with a secure personal password.
          </p>
        </div>

        {/* Form */}
        <form className="p-5 sm:p-6 flex flex-col gap-5" onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#171c1f]">New Password</label>
            <div className="relative">
              <input
                className={inputCls}
                placeholder="••••••••"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474e] hover:text-[#022448]">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength bar */}
            {newPassword && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold ${strength < 40 ? 'text-red-600' : strength < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                    {strengthText}
                  </span>
                  <span className="text-xs text-[#43474e]">{strength}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e4e9ed] rounded-full overflow-hidden">
                  <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strength}%` }} />
                </div>
                <p className="text-[11px] text-[#43474e] italic">{strengthHint}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#171c1f]">Confirm Password</label>
            <div className="relative">
              <input
                className={inputCls}
                placeholder="••••••••"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474e] hover:text-[#022448]">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
            {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
              <p className="text-xs text-green-600 font-medium">✓ Passwords match</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary text-sm font-semibold rounded-btn hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
          >
            {loading
              ? 'Updating…'
              : <><span>Update Password</span><Key size={16} /></>
            }
          </button>

          <div className="flex items-center justify-center gap-2 text-[#43474e]">
            <Lock size={13} />
            <span className="text-[11px]">Secured with institutional-grade encryption.</span>
          </div>
        </form>

        {/* Footer bar */}
        <div className="bg-[#e4e9ed]/50 px-4 py-2 flex justify-center border-t border-[#c4c6cf]/30">
          <span className="text-[10px] font-mono text-[#43474e] uppercase tracking-widest">
            System-ID: SCA-SEC-4492
          </span>
        </div>
      </div>
    </div>
  )
}
