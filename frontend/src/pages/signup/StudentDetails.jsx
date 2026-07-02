import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, GraduationCap, Lock, Eye, EyeOff, Info, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSignupStore from '../../store/signupStore'

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Invalid email'),
  phone: z.string().optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  program: z.string().min(1, 'Program is required'),
  degree: z.string().min(1, 'Degree is required'),
  semester: z.string().min(1, 'Semester is required'),
  section: z.string().min(1, 'Section is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function StudentDetails() {
  const navigate = useNavigate()
  const { setDetails, role, resetSignup } = useSignupStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!role || role !== 'student') {
    resetSignup()
    navigate('/signup')
    return null
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(studentSchema),
  })

  const password = watch('password')
  const getPasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length > 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd)) strength += 25
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25
    return strength
  }

  const strength = getPasswordStrength(password || '')
  const strengthText = strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'
  const strengthColor = strength < 50 ? 'bg-red-500' : strength < 75 ? 'bg-amber-500' : 'bg-green-500'

  const onSubmit = (data) => {
    setDetails(data)
    navigate('/signup/documents')
  }

  return (
    <div className="bg-[#f6fafe] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="w-full h-[60px] flex items-center justify-between px-6 bg-white border-b border-[#c4c6cf]">
        <div className="flex items-center gap-2">
          <img src="/sca.png" alt="SCA Logo" className="h-14 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#43474e] text-sm">Already have an account?</span>
          <Link to="/portal" className="text-[#0051d5] text-sm font-semibold hover:underline flex items-center gap-1">
            LogIn <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center py-6 px-4">
        {/* Step Progress Indicator */}
        <div className="w-full max-w-[600px] flex items-center justify-between mb-6 px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm font-semibold text-green-700">Role</span>
          </div>
          <div className="h-[2px] bg-[#022448] flex-grow mx-4"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#022448] text-white flex items-center justify-center font-bold">2</div>
            <span className="text-sm font-semibold text-[#022448]">Details</span>
          </div>
          <div className="h-[2px] bg-[#c4c6cf] flex-grow mx-4"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#dfe3e7] text-[#74777f] flex items-center justify-center font-bold">3</div>
            <span className="text-sm font-semibold text-[#74777f]">Documents</span>
          </div>
        </div>

        {/* Signup Form Container */}
        <div className="w-full max-w-[600px] bg-white border border-[#c4c6cf] rounded-xl shadow-sm overflow-hidden mb-12">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              {/* Section: Personal Information */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <User size={16} className="text-[#022448]" />
                  <h2 className="text-sm font-semibold text-[#022448] uppercase tracking-wide">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">First Name</label>
                    <input
                      className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      type="text"
                      {...register('firstName')}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Last Name</label>
                    <input
                      className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      type="text"
                      {...register('lastName')}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#43474e]">Personal Email</label>
                  <input
                    className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    type="email"
                    {...register('personalEmail')}
                    placeholder="Enter personal email"
                  />
                  <p className="text-xs text-[#74777f] flex items-center gap-1">
                    <Info size={12} />
                    Verification link will be sent to this email.
                  </p>
                  {errors.personalEmail && <p className="text-red-500 text-xs">{errors.personalEmail.message}</p>}
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#43474e]">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-20 px-3 py-2 bg-[#eaeef2] border border-[#c4c6cf] rounded-lg flex items-center justify-center text-sm text-[#43474e]">
                      +91
                    </div>
                    <input
                      className="flex-grow px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      type="tel"
                      {...register('phone')}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-[#c4c6cf] opacity-50" />

              {/* Section: Academic Information */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={16} className="text-[#022448]" />
                  <h2 className="text-sm font-semibold text-[#022448] uppercase tracking-wide">Academic Information</h2>
                </div>
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-semibold text-[#43474e]">Registration Number</label>
                  <input
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg font-['JetBrains_Mono'] text-xs text-[#022448] tracking-wider"
                    type="text"
                    {...register('registrationNumber')}
                    placeholder="Enter registration number"
                  />
                  {errors.registrationNumber && <p className="text-red-500 text-xs">{errors.registrationNumber.message}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Program</label>
                    <input
                      className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      type="text"
                      {...register('program')}
                      placeholder="e.g., CSE"
                    />
                    {errors.program && <p className="text-red-500 text-xs">{errors.program.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Degree</label>
                    <input
                      className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      type="text"
                      {...register('degree')}
                      placeholder="e.g., MCA"
                    />
                    {errors.degree && <p className="text-red-500 text-xs">{errors.degree.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Semester</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      {...register('semester')}
                    >
                      <option value="">Select</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                      <option value="5th">5th</option>
                      <option value="6th">6th</option>
                      <option value="7th">7th</option>
                      <option value="8th">8th</option>
                    </select>
                    {errors.semester && <p className="text-red-500 text-xs">{errors.semester.message}</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#43474e]">Section</label>
                  <input
                    className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    type="text"
                    {...register('section')}
                    placeholder="e.g., K22CW"
                  />
                  {errors.section && <p className="text-red-500 text-xs">{errors.section.message}</p>}
                </div>
              </section>

              <hr className="border-[#c4c6cf] opacity-50" />

              {/* Section: Set Password */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={16} className="text-[#022448]" />
                  <h2 className="text-sm font-semibold text-[#022448] uppercase tracking-wide">Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Password</label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 pr-10 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Strength Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#74777f]">Strength:</span>
                        <span className={`font-bold ${strength < 50 ? 'text-red-500' : strength < 75 ? 'text-amber-500' : 'text-green-500'}`}>{strengthText}</span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        <div className={`flex-grow rounded-full ${strength >= 25 ? strengthColor : 'bg-[#c4c6cf]'}`}></div>
                        <div className={`flex-grow rounded-full ${strength >= 50 ? strengthColor : 'bg-[#c4c6cf]'}`}></div>
                        <div className={`flex-grow rounded-full ${strength >= 75 ? strengthColor : 'bg-[#c4c6cf]'}`}></div>
                        <div className={`flex-grow rounded-full ${strength >= 100 ? strengthColor : 'bg-[#c4c6cf]'}`}></div>
                      </div>
                    </div>
                    {/* Requirements */}
                    <ul className="mt-3 space-y-1">
                      <li className={`flex items-center gap-2 text-xs ${password && password.length >= 8 ? 'text-green-600' : 'text-[#74777f]'}`}>
                        {password && password.length >= 8 ? <CheckCircle2 size={12} /> : <span>•</span>} At least 8 characters
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${password && /[A-Z]/.test(password) ? 'text-green-600' : 'text-[#74777f]'}`}>
                        {password && /[A-Z]/.test(password) ? <CheckCircle2 size={12} /> : <span>•</span>} One uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${password && /[0-9]/.test(password) ? 'text-green-600' : 'text-[#74777f]'}`}>
                        {password && /[0-9]/.test(password) ? <CheckCircle2 size={12} /> : <span>•</span>} One number
                      </li>
                    </ul>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Confirm Password</label>
                    <div className="relative">
                      <input
                        className="w-full px-3 py-2 pr-10 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#022448] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && watch('confirmPassword') && password === watch('confirmPassword') && (
                      <p className="text-green-600 text-xs font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} /> Passwords match
                      </p>
                    )}
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </section>
            </div>

            <div className="bg-[#f0f4f8] p-6 flex items-center justify-between border-t border-[#c4c6cf]">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-5 py-2.5 flex items-center gap-2 text-primary text-sm font-semibold border-2 border-primary rounded-btn hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-btn hover:opacity-90 transition-all flex items-center gap-2 active:scale-[0.98] shadow-md"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>

        <div className="text-center text-[#74777f] text-sm pb-6 flex flex-col items-center gap-1">
          <p>SCA Institutional Portal © 2024. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}