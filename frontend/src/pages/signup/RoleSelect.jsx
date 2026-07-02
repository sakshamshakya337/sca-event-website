import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, User, CheckCircle2, ArrowRight } from 'lucide-react'
import useSignupStore from '../../store/signupStore'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setRole } = useSignupStore()
  const [selectedRole, setSelectedRole] = useState(null)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setRole(role)
  }

  const handleContinue = () => {
    if (selectedRole) navigate(`/signup/${selectedRole}`)
  }

  return (
    <div className="bg-[#fff8f3] font-['Inter'] text-[#1e1b18] antialiased min-h-screen flex flex-col">

      {/* Top Bar */}
      <header className="w-full h-[60px] bg-white border-b border-[#ddc1b2] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/sca.png" alt="SCA Logo" className="h-14 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#564337]">Already have an account?</span>
          <Link
            to="/portal"
            className="bg-primary text-on-primary px-5 py-2 rounded-btn text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            Login <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center py-10 px-6">

        {/* Step Progress */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-[520px]">
          {/* Step 1 — active */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-sm">
              1
            </div>
            <span className="text-sm font-semibold text-primary">Role</span>
          </div>
          <div className="flex-grow h-[2px] bg-[#ddc1b2] rounded-full"></div>
          {/* Step 2 */}
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-8 h-8 rounded-full bg-[#e8e1dc] flex items-center justify-center text-[#564337] text-sm font-bold">
              2
            </div>
            <span className="text-sm font-semibold text-[#564337]">Details</span>
          </div>
          <div className="flex-grow h-[2px] bg-[#ddc1b2] rounded-full opacity-40"></div>
          {/* Step 3 */}
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-8 h-8 rounded-full bg-[#e8e1dc] flex items-center justify-center text-[#564337] text-sm font-bold">
              3
            </div>
            <span className="text-sm font-semibold text-[#564337]">Upload</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm w-full max-w-[520px] border border-[#ddc1b2] overflow-hidden">
          <div className="p-8">

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#022448] mb-1">Choose Your Role</h1>
              <p className="text-sm text-[#564337]">
                Select your institutional status to get started.
              </p>
            </div>

            {/* Role Cards */}
            <div className="space-y-4">

              {/* Student */}
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`w-full text-left border-2 rounded-xl p-5 transition-all duration-200 group ${
                  selectedRole === 'student'
                    ? 'border-primary bg-[#fff0e6] shadow-sm'
                    : 'border-[#ddc1b2] bg-white hover:border-primary/50 hover:bg-[#fff8f3]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${
                    selectedRole === 'student' ? 'bg-primary/10' : 'bg-[#f3ede8] group-hover:bg-primary/10'
                  }`}>
                    <User
                      size={22}
                      className={selectedRole === 'student' ? 'text-primary' : 'text-[#564337]'}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-[#022448]">Student</h3>
                      {selectedRole === 'student' && (
                        <CheckCircle2 size={18} className="text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-[#564337] leading-relaxed">
                      Register for events, track credits, and manage student organisation activities.
                    </p>
                  </div>
                </div>
              </button>

              {/* Faculty */}
              <button
                type="button"
                onClick={() => handleRoleSelect('faculty')}
                className={`w-full text-left border-2 rounded-xl p-5 transition-all duration-200 group ${
                  selectedRole === 'faculty'
                    ? 'border-primary bg-[#fff0e6] shadow-sm'
                    : 'border-[#ddc1b2] bg-white hover:border-primary/50 hover:bg-[#fff8f3]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg transition-colors ${
                    selectedRole === 'faculty' ? 'bg-primary/10' : 'bg-[#f3ede8] group-hover:bg-primary/10'
                  }`}>
                    <GraduationCap
                      size={22}
                      className={selectedRole === 'faculty' ? 'text-primary' : 'text-[#564337]'}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-[#022448]">Faculty</h3>
                      {selectedRole === 'faculty' && (
                        <CheckCircle2 size={18} className="text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-[#564337] leading-relaxed">
                      Host seminars, manage academic calendars, and approve student event requests.
                    </p>
                  </div>
                </div>
              </button>

            </div>

            {/* Continue Button */}
            <div className="mt-6 pt-6 border-t border-[#e8e1dc]">
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full bg-primary text-on-primary py-3.5 px-6 rounded-btn text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Continue as {selectedRole === 'student' ? 'Student' : selectedRole === 'faculty' ? 'Faculty' : '...'}
                <ArrowRight size={16} />
              </button>
              <p className="mt-4 text-center text-xs text-[#8a7265] px-4">
                By proceeding you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center gap-2 text-[#8a7265]/60">
          <GraduationCap size={14} />
          <span className="text-xs font-medium tracking-widest uppercase">Secure Institutional Access</span>
        </div>

      </main>
    </div>
  )
}
