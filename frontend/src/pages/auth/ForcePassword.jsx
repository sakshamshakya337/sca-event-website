import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Key, Lock, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'
import toast from 'react-hot-toast'

export default function ForcePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/change-password', {
        newPassword
      })

      const { user: updatedUser, token } = res.data.data
      login(updatedUser, token)
      toast.success('Password updated successfully!')

      const roleNavMap = {
        student: '/student',
        faculty: '/faculty',
        admin: '/admin',
        superadmin: '/superadmin'
      }
      navigate(roleNavMap[updatedUser.role] || '/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  // Password strength calculator
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length > 6) strength += 20
    if (password.length > 10) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[^A-Za-z0-9]/.test(password)) strength += 20
    return strength
  }

  const strength = getPasswordStrength(newPassword)
  const strengthColor = strength < 40 ? 'bg-red-500' : strength < 70 ? 'bg-amber-500' : 'bg-green-500'
  const strengthText = strength < 40 ? 'Weak' : strength < 70 ? 'Medium' : 'Strong'

  return (
    <div className="bg-[#f6fafe] font-[Inter] text-[#171c1f] antialiased min-h-screen">
      {/* Backdrop Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center p-6">
        {/* Modal Card */}
        <div className="w-full max-w-[420px] bg-white rounded-xl border border-[#c4c6cf] shadow-lg overflow-hidden flex flex-col">
          {/* Header Section */}
          <div className="p-6 text-center flex flex-col items-center gap-2 border-b border-[#c4c6cf]/30">
            {/* Amber AlertTriangle Icon */}
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-2">
              <AlertTriangle className="text-amber-600" size={32} />
            </div>
            <h1 className="text-lg font-semibold text-[#022448]">Set Your New Password</h1>
            <p className="text-sm text-[#43474e] px-4">
              As a new user of the SCA Portal, you must replace your temporary credentials with a secure, personal password.
            </p>
          </div>
          {/* Form Body */}
          <form className="p-6 flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#171c1f]">New Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all text-sm text-[#171c1f]"
                  placeholder="••••••••"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474e] hover:text-[#022448] transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  type="button"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Password Strength Component */}
              <div className="mt-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold ${strength < 40 ? 'text-red-600' : strength < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                    Strength: {strengthText}
                  </span>
                  <span className="text-xs text-[#43474e]">{strength}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e4e9ed] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-500`}
                    style={{
                      width: `${strength}%`,
                      boxShadow: strength < 70 ? '0 0 8px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-[#43474e] italic">
                  {strength < 40 ? 'Plus uppercase, lowercase, and numbers' : strength < 70 ? 'Plus a special character to make it strong' : 'Great! Your password is strong'}
                </p>
              </div>
            </div>
            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#171c1f]">Confirm Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all text-sm text-[#171c1f]"
                  placeholder="••••••••"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474e] hover:text-[#022448] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
            {/* Actions */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                disabled={loading}
                className="w-full py-3 bg-[#0051d5] text-white text-sm font-semibold rounded-lg hover:bg-[#003ea8] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Updating Password...' : (
                  <>
                    <span>Update Password</span>
                    <Key size={18} />
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 justify-center py-2">
                <Lock className="text-[#43474e]" size={16} />
                <span className="text-xs text-[#43474e]">Your data is secured with institutional-grade encryption.</span>
              </div>
            </div>
          </form>
          {/* Decorative Technical Footer */}
          <div className="bg-[#e4e9ed]/50 p-2 flex justify-center items-center gap-4 border-t border-[#c4c6cf]/30">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-[JetBrains Mono] text-[#43474e] uppercase tracking-widest">System-ID:</span>
              <span className="font-[JetBrains Mono] text-xs text-[#022448]">SCA-SEC-4492</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
