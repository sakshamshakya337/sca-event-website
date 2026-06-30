import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdPerson, MdSchool, MdLock, MdVerified, MdPhone, MdVisibility, MdVisibilityOff, MdCheckCircle, MdArrowBack, MdArrowForward } from 'react-icons/md'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSignupStore from '../../store/signupStore'

const facultySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Invalid email'),
  officialEmail: z.string().email('Invalid official email'),
  phone: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function FacultyDetails() {
  const navigate = useNavigate()
  const { setDetails, role, resetSignup } = useSignupStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!role || role !== 'faculty') {
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
    resolver: zodResolver(facultySchema),
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
    <div className="bg-[#f1f5f9] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-[#c4c6cf] h-[60px] flex items-center px-6 shrink-0">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
          </div>
          <Link to="/portal" className="text-sm font-semibold text-[#0051d5] hover:underline flex items-center gap-1">
            Already have an account? LogIn <MdArrowForward className="text-sm" />
          </Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-start justify-center py-6 px-4">
        <div className="w-full max-w-[600px] flex flex-col gap-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center border-2 border-green-200">
                <MdCheckCircle className="text-lg font-bold" />
              </div>
              <span className="text-xs font-['JetBrains_Mono'] text-green-700">Role</span>
            </div>
            <div className="flex-grow h-[2px] mx-4 bg-[#1e3a5f] mb-6"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center border-2 border-[#1e3a5f]">
                <span className="text-sm font-bold">2</span>
              </div>
              <span className="text-xs font-semibold text-[#022448]">Details</span>
            </div>
            <div className="flex-grow h-[2px] mx-4 bg-[#c4c6cf] mb-6"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#c4c6cf] text-[#74777f] flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="text-xs font-semibold text-[#74777f]">Upload</span>
            </div>
          </div>

          {/* Details Form Container */}
          <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-6">
                {/* Section: Personal Information */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MdPerson className="text-[#022448]" />
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
                    {errors.personalEmail && <p className="text-red-500 text-xs">{errors.personalEmail.message}</p>}
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#43474e]">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="w-20 px-3 py-2 bg-[#e4e9ed] border border-[#c4c6cf] rounded-lg flex items-center justify-center text-sm text-[#43474e]">
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

                {/* Section: Professional Information */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MdSchool className="text-[#022448]" />
                    <h2 className="text-sm font-semibold text-[#022448] uppercase tracking-wide">Professional Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#43474e]">Employee ID</label>
                      <input
                        className="w-full px-3 py-2 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg font-['JetBrains_Mono'] text-xs text-[#022448] tracking-wider"
                        type="text"
                        {...register('employeeId')}
                        placeholder="Enter employee ID"
                      />
                      {errors.employeeId && <p className="text-red-500 text-xs">{errors.employeeId.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#43474e]">Official Email</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                        type="email"
                        {...register('officialEmail')}
                        placeholder="official@lpu.edu.in"
                      />
                      {errors.officialEmail && <p className="text-red-500 text-xs">{errors.officialEmail.message}</p>}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#43474e]">Department</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                        type="text"
                        {...register('department')}
                        placeholder="e.g., School of Computer Application"
                      />
                      {errors.department && <p className="text-red-500 text-xs">{errors.department.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#43474e]">Designation</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                        type="text"
                        {...register('designation')}
                        placeholder="e.g., Assistant Professor"
                      />
                      {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
                    </div>
                  </div>
                </section>

                <hr className="border-[#c4c6cf] opacity-50" />

                {/* Section: Set Password */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MdLock className="text-[#022448]" />
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
                          {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
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
                        <li className={`flex items-center gap-2 text-xs ${password && password.length >= 8 ? 'text-emerald-600' : 'text-[#74777f]'}`}>
                          {password && password.length >= 8 ? <MdCheckCircle className="text-xs" /> : <span>•</span>} At least 8 characters
                        </li>
                        <li className={`flex items-center gap-2 text-xs ${password && /[A-Z]/.test(password) ? 'text-emerald-600' : 'text-[#74777f]'}`}>
                          {password && /[A-Z]/.test(password) ? <MdCheckCircle className="text-xs" /> : <span>•</span>} One uppercase letter
                        </li>
                        <li className={`flex items-center gap-2 text-xs ${password && /[0-9]/.test(password) ? 'text-emerald-600' : 'text-[#74777f]'}`}>
                          {password && /[0-9]/.test(password) ? <MdCheckCircle className="text-xs" /> : <span>•</span>} One number
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
                          {showConfirmPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                        </button>
                      </div>
                      {password && watch('confirmPassword') && password === watch('confirmPassword') && (
                        <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1 mt-1">
                          <MdCheckCircle className="text-xs" /> Passwords match
                        </p>
                      )}
                      {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer Actions */}
              <div className="bg-[#f0f4f8] p-6 flex items-center justify-between border-t border-[#c4c6cf]">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 flex items-center gap-2 text-[#43474e] text-sm font-semibold hover:bg-white rounded-lg transition-colors"
                >
                  <MdArrowBack />
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0051d5] text-white text-sm font-semibold rounded-lg hover:bg-[#316bf3] transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  Continue
                  <MdArrowForward />
                </button>
              </div>
            </form>
          </div>

          <div className="text-center text-[#74777f] text-sm pb-6 flex flex-col items-center gap-1">
            <p>SCA Institutional Portal © 2024. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}