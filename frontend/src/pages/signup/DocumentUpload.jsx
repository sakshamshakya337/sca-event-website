import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdCloudUpload, MdClose, MdDescription, MdImage, MdCheckCircle, MdArrowForward, MdLoop } from 'react-icons/md'
import { useDropzone } from 'react-dropzone'
import useSignupStore from '../../store/signupStore'
import useAuthStore from '../../store/authStore'
import api from '../../config/axios'

export default function DocumentUpload() {
  const navigate = useNavigate()
  const { role, details, setDocuments, resetSignup } = useSignupStore()
  const { login: setAuthState } = useAuthStore()
  const [universityId, setUniversityId] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Redirect if no role or details
  if (!role || !details?.firstName) {
    resetSignup()
    navigate('/signup')
    return null
  }

  const onDropUniversityId = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUniversityId({
        file,
        preview: URL.createObjectURL(file)
      })
    }
  }, [])

  const onDropProfilePhoto = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setProfilePhoto({
        file,
        preview: URL.createObjectURL(file)
      })
    }
  }, [])

  const {
    getRootProps: getIdRootProps,
    getInputProps: getIdInputProps,
    isDragActive: isIdDragActive
  } = useDropzone({
    onDrop: onDropUniversityId,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const {
    getRootProps: getPhotoRootProps,
    getInputProps: getPhotoInputProps,
    isDragActive: isPhotoDragActive
  } = useDropzone({
    onDrop: onDropProfilePhoto,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!universityId || !profilePhoto) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // 1. Sign up the user
      const signupData = {
        role,
        ...details
      }
      
      const signupRes = await api.post('/auth/signup', signupData)
      const { user, token } = signupRes.data.data
      
      // 2. Set auth state
      setAuthState(user, token)
      setDocuments({ universityId, profilePhoto })
      
      // 3. Submit verification application
      const formData = new FormData()
      formData.append('universityId', universityId.file)
      formData.append('profilePhoto', profilePhoto.file)
      
      await api.post('/verification', formData)
      
      // 4. Navigate to home page
      navigate('/')
    } catch (err) {
      console.error('Signup/verification error:', err)
      setError(err.response?.data?.message || 'Something went wrong')
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

  return (
    <div className="bg-[#f6fafe] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      {/* TopNavBar (Fixed) */}
      <nav className="fixed top-0 w-full h-[60px] z-50 bg-white border-b border-[#c4c6cf] flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/portal" className="bg-[#022448] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-colors">
            LogIn
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mt-[60px] flex-grow flex flex-col items-center py-6 px-6">
        {/* Onboarding Progress Indicator */}
        <div className="w-full max-w-3xl mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#c4c6cf] -z-10 -translate-y-1/2"></div>
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-[#f6fafe] px-4">
              <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-sm">
                <MdCheckCircle className="text-[20px]" />
              </div>
              <span className="text-sm text-[#43474e]">Account Info</span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-[#f6fafe] px-4">
              <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-sm">
                <MdCheckCircle className="text-[20px]" />
              </div>
              <span className="text-sm text-[#43474e]">Personal Details</span>
            </div>
            {/* Step 3 (Active) */}
            <div className="flex flex-col items-center gap-2 bg-[#f6fafe] px-4">
              <div className="w-10 h-10 rounded-full bg-[#022448] text-white flex items-center justify-center shadow-sm ring-4 ring-[#022448]/10">
                <span className="text-sm font-semibold">3</span>
              </div>
              <span className="text-sm font-semibold text-[#022448]">Verification</span>
            </div>
          </div>
        </div>

        {/* Main Transactional Card */}
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Document Preview & Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-[#022448] mb-2">Upload Documents</h1>
              <p className="text-sm text-[#43474e] mb-6">Your identification documents will be securely stored and attached to your profile.</p>
              <div className="flex flex-col gap-4">
                {/* Success Preview Card 1 */}
                {universityId ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ecfdf5] border border-emerald-100 group transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 bg-white flex items-center justify-center">
                        {universityId.file.type.includes('image') ? (
                          <img src={universityId.preview} alt="University ID preview" className="w-full h-full object-cover" />
                        ) : (
                          <MdDescription className="text-emerald-600" size={24} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] text-emerald-900">{universityId.file.name}</span>
                        <span className="text-sm text-emerald-700">{(universityId.file.size / 1024 / 1024).toFixed(2)} MB • Uploaded</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MdCheckCircle className="text-emerald-600" />
                      <button type="button" onClick={removeUniversityId} className="text-emerald-800 hover:bg-emerald-200/50 p-2 rounded-full transition-colors">
                        <MdClose size={20} />
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
                      <MdCloudUpload className="mx-auto text-[#74777f] mb-4" size={40} />
                      <p className="text-[#43474e] mb-2">
                        {isIdDragActive ? 'Drop the file here...' : 'Click or drag file to upload'}
                      </p>
                      <p className="text-xs text-[#74777f]">PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}

                {/* Success Preview Card 2 */}
                {profilePhoto ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ecfdf5] border border-emerald-100 group transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 bg-white">
                        <img src={profilePhoto.preview} alt="Profile photo preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] text-emerald-900">{profilePhoto.file.name}</span>
                        <span className="text-sm text-emerald-700">{(profilePhoto.file.size / 1024 / 1024).toFixed(2)} MB • Uploaded</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MdCheckCircle className="text-emerald-600" />
                      <button type="button" onClick={removeProfilePhoto} className="text-emerald-800 hover:bg-emerald-200/50 p-2 rounded-full transition-colors">
                        <MdClose size={20} />
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
                      <MdCloudUpload className="mx-auto text-[#74777f] mb-4" size={40} />
                      <p className="text-[#43474e] mb-2">
                        {isPhotoDragActive ? 'Drop the image here...' : 'Click or drag image to upload'}
                      </p>
                      <p className="text-xs text-[#74777f]">PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={!universityId || !profilePhoto || isSubmitting}
                className="w-full mt-8 bg-[#0051d5] text-white py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#316bf3] active:scale-[0.98] transition-all shadow-lg shadow-[#0051d5]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <MdLoop className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <MdArrowForward />
                  </>
                )}
              </button>
              <p className="text-center text-sm text-[#43474e] mt-4">By clicking complete, you agree to our verification terms.</p>
            </div>
          </div>

          {/* Right: Summary Box */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8fafc] border border-[#c4c6cf] rounded-xl p-6 sticky top-[84px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#022448]">Profile Summary</h2>
                <button type="button" onClick={() => navigate(-1)} className="text-[#43474e] cursor-pointer hover:text-[#0051d5] flex items-center gap-1">
                  <MdArrowBack size={16} />
                  Edit
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
                    <span className="text-sm font-semibold text-[#022448]">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
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
                    <span className="text-sm font-semibold text-[#022448]">{details.degree} {details.program} — {details.semester} Semester</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-[#43474e] text-sm uppercase tracking-wider">Mail</span>
                  <span className="text-sm font-semibold text-[#022448]">{details.personalEmail}</span>
                </div>
              </div>

              {/* Helpful Notice */}
              <div className="mt-8 p-4 bg-[#1e3a5f]/10 rounded-lg border border-[#1e3a5f]/20 flex gap-3">
                <div className="text-[#1e3a5f]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <p className="text-sm text-[#1e3a5f]">Verification typically takes 24-48 hours. You will receive an email confirmation once your account is active.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 mt-auto bg-[#f0f4f8] border-t border-[#c4c6cf] px-6 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img src="/sca.png" alt="SCA Logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm text-[#43474e] text-center md:text-left">© 2024 School of Computer Application. Institutional Event Management System.</span>
            <span className="text-xs text-[#43474e] text-center md:text-left mt-1">Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-[#0051d5] hover:underline">Saksham shakya</a> | <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-[#0051d5] hover:underline">Portfolio</a></span>
          </div>
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-[#43474e] hover:text-[#0051d5] transition-colors">Support</a>
        </div>
      </footer>
    </div>
  )
}