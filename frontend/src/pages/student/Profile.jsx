import { useState, useEffect } from 'react'
import {
  MdPhotoCamera,
  MdCloudUpload,
  MdEdit,
  MdSave,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdClose,
  MdContactMail,
  MdCall,
  MdSecurity
} from 'react-icons/md'
import PageWrapper from '../../components/layout/PageWrapper'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'

export default function StudentProfile() {
  const { user, setUser } = useAuthStore()
  const [showToast, setShowToast] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoPreviewObjectUrl, setPhotoPreviewObjectUrl] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    phone: '',
    program: '',
    degree: '',
    semester: '',
    section: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        personalEmail: user.personalEmail || '',
        phone: user.phone || '',
        program: user.program || '',
        degree: user.degree || '',
        semester: user.semester || '',
        section: user.section || ''
      })
      if (user.profilePhotoUrl) {
        setPhotoPreview(user.profilePhotoUrl)
      }
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (photoPreviewObjectUrl) {
        URL.revokeObjectURL(photoPreviewObjectUrl)
      }
    }
  }, [photoPreviewObjectUrl])

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        e.target.value = ''
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Profile photo must be under 5MB')
        e.target.value = ''
        return
      }

      if (photoPreviewObjectUrl) {
        URL.revokeObjectURL(photoPreviewObjectUrl)
      }

      const objectUrl = URL.createObjectURL(file)
      setProfilePhoto(file)
      setPhotoPreviewObjectUrl(objectUrl)
      setPhotoPreview(objectUrl)

      setPhotoUploading(true)
      try {
        const form = new FormData()
        form.append('profilePhoto', file)
        const res = await api.put('/users/me/profile', form)
        const updatedUser = res.data.data
        setUser(updatedUser)
        setProfilePhoto(null)
        setPhotoPreview(updatedUser.profilePhotoUrl || null)
        URL.revokeObjectURL(objectUrl)
        setPhotoPreviewObjectUrl(null)
        alert('Profile photo uploaded successfully!')
      } catch (err) {
        console.error(err)
        setPhotoPreview(user?.profilePhotoUrl || null)
        alert(err.response?.data?.message || 'Failed to upload profile photo')
      } finally {
        setPhotoUploading(false)
        e.target.value = ''
      }
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData()
      Object.keys(formData).forEach(key => {
        form.append(key, formData[key] ?? '')
      })
      if (profilePhoto) {
        form.append('profilePhoto', profilePhoto)
      }
      const res = await api.put('/users/me/profile', form)
      const updatedUser = res.data.data
      setUser(updatedUser)
      setProfilePhoto(null)
      if (updatedUser.profilePhotoUrl) {
        setPhotoPreview(updatedUser.profilePhotoUrl)
      }
      alert('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        newPassword: passwordData.newPassword
      })
      alert('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-on-surface-variant">Loading...</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border-l-4 border-green-500 p-4 rounded shadow-lg">
          <MdCheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold text-on-surface">Profile updated successfully!</p>
            <p className="text-sm text-on-surface-variant">Changes saved to your account.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-on-surface-variant hover:text-on-surface">
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-80 bg-primary-container p-8 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-tertiary flex items-center justify-center text-white text-4xl font-bold border-4 border-primary/20 shadow-lg">
                  {getInitials()}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <MdEdit className="text-white" size={24} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <h3 className="mt-6 text-headline-lg text-white font-bold">
              {user?.firstName || 'Student'} {user?.lastName || 'User'}
            </h3>
            <div className="mt-2 inline-flex px-3 py-1 bg-tertiary rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
              {user?.role?.toUpperCase() || 'Student'}
            </div>
            <p className="mt-4 text-body-sm text-on-primary-container">{user?.personalEmail || user?.officialEmail || 'student@university.edu'}</p>
            <p className="mt-1 text-body-sm text-primary-container/60">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2023'}</p>
            <label className="mt-8 w-full py-2.5 border border-white/30 text-white rounded-lg text-headline-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <MdCloudUpload size={16} />
              {photoUploading ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={photoUploading}
              />
            </label>
            <div className="mt-auto pt-10 text-left w-full border-t border-white/10">
              <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">Account Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white font-bold">0</p>
                  <p className="text-white/60 text-[10px]">Events Joined</p>
                </div>
                <div>
                  <p className="text-white font-bold">0</p>
                  <p className="text-white/60 text-[10px]">Tasks Assigned</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-lowest p-8 space-y-10">
            <form onSubmit={handleProfileSubmit} className="space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MdContactMail className="text-secondary" size={24} />
                  <h4 className="text-headline-md text-primary font-bold">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">First Name</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Last Name</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Program</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Degree</label>
                    <select
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    >
                      <option value="">Select Degree</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Semester</label>
                    <select
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="4th">4th Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="6th">6th Semester</option>
                      <option value="7th">7th Semester</option>
                      <option value="8th">8th Semester</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Section</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MdContactMail className="text-secondary" size={24} />
                  <h4 className="text-headline-md text-primary font-bold">Contact Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Official Email</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm text-on-surface-variant italic"
                      readOnly
                      type="email"
                      value={user?.officialEmail || user?.registrationNumber ? `${user.registrationNumber}@lpu.edu.in` : 'student@sca.lpu.edu.in'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Personal Email</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Phone Number</label>
                    <div className="relative">
                      <MdCall className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={16} />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-secondary text-white rounded-lg text-headline-sm hover:bg-secondary/90 active:scale-95 transition-all flex items-center gap-2"
                >
                  <MdSave className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordSubmit} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-6">
                <MdSecurity className="text-secondary" size={24} />
                <h4 className="text-headline-md text-primary font-bold">Security & Password</h4>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Current Password</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none pr-10"
                        placeholder="••••••••"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {showCurrentPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </button>
                    </div>
                  </div>
                  <div></div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">New Password</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none pr-10"
                        placeholder="Enter new password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {showNewPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-body-sm font-semibold text-on-surface-variant">Confirm New Password</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none pr-10"
                        placeholder="Repeat new password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-secondary text-white rounded-lg text-headline-sm hover:bg-secondary/90 active:scale-95 transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="text-body-sm text-on-surface-variant">Account Secured</div>
                </div>
                <div className="text-body-sm text-outline">Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Today'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
