import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, User, CheckCircle, ArrowRight } from 'lucide-react'
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
    navigate(`/signup/${selectedRole}`)
  }

  return (
    <div className="bg-[#f1f5f9] font-['Inter'] text-[#171c1f] antialiased min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full h-[60px] bg-white border-b border-[#c4c6cf] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#43474e]">Already have an account?</span>
          <Link to="/portal" className="text-sm font-semibold text-[#2563eb] hover:underline transition-all">LogIn</Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center py-6 px-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-4 mb-6 w-full max-w-[560px] justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-bold">1</div>
            <span className="text-sm font-semibold text-[#1e3a5f]">Role</span>
          </div>
          <div className="w-12 h-[1px] bg-[#c4c6cf]"></div>
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#dfe3e7] flex items-center justify-center text-[#43474e] text-sm font-bold">2</div>
            <span className="text-sm font-semibold text-[#43474e]">Details</span>
          </div>
          <div className="w-12 h-[1px] bg-[#c4c6cf]"></div>
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#dfe3e7] flex items-center justify-center text-[#43474e] text-sm font-bold">3</div>
            <span className="text-sm font-semibold text-[#43474e]">Documents</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg w-full max-w-[560px] border border-[#c4c6cf] overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#022448] mb-2">Choose Your Role</h1>
              <p className="text-sm text-[#43474e]">Select your primary status to personalize your event management experience.</p>
            </div>

            {/* Role Cards Stack */}
            <div className="space-y-4">
              {/* Student Card */}
              <div
                onClick={() => handleRoleSelect('student')}
                className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 ${
                  selectedRole === 'student'
                    ? 'border-[#2563eb] bg-[#eff6ff]'
                    : 'border-[#c4c6cf] bg-white hover:border-[#2563eb] hover:bg-[#f6fafe]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${selectedRole === 'student' ? 'bg-[#2563eb]/10' : 'bg-[#e4e9ed]'}`}>
                    <User className={`text-2xl ${selectedRole === 'student' ? 'text-[#2563eb]' : 'text-[#43474e]'}`} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-semibold text-[#1e3a5f]">Student</h3>
                      {selectedRole === 'student' && <CheckCircle className="text-[#2563eb]" />}
                    </div>
                    <p className="text-sm text-[#43474e] mb-4">Register for events, track credits, and manage student organization activities.</p>
                    <div className={`text-sm font-bold flex items-center gap-1 ${selectedRole === 'student' ? 'text-[#2563eb]' : 'text-[#43474e] opacity-0 group-hover:opacity-100'}`}>
                      Select <ArrowRight className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculty Card */}
              <div
                onClick={() => handleRoleSelect('faculty')}
                className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 ${
                  selectedRole === 'faculty'
                    ? 'border-[#2563eb] bg-[#eff6ff]'
                    : 'border-[#c4c6cf] bg-white hover:border-[#2563eb] hover:bg-[#f6fafe]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${selectedRole === 'faculty' ? 'bg-[#2563eb]/10' : 'bg-[#e4e9ed]'}`}>
                    <GraduationCap className={`text-2xl ${selectedRole === 'faculty' ? 'text-[#2563eb]' : 'text-[#43474e]'}`} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-semibold text-[#022448]">Faculty</h3>
                      {selectedRole === 'faculty' && <CheckCircle className="text-[#2563eb]" />}
                    </div>
                    <p className="text-sm text-[#43474e] mb-4">Host seminars, manage academic calendars, and approve student event requests.</p>
                    <div className={`text-sm font-bold flex items-center gap-1 ${selectedRole === 'faculty' ? 'text-[#2563eb]' : 'text-[#43474e] opacity-0 group-hover:opacity-100'}`}>
                      Select <ArrowRight className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-6 border-t border-[#c4c6cf]/30">
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full bg-[#2563eb] text-white py-4 px-6 rounded-lg text-sm font-semibold hover:bg-[#1d4ed8] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with {selectedRole === 'student' ? 'Student' : selectedRole === 'faculty' ? 'Faculty' : 'Role'}
                <ArrowRight />
              </button>
              <p className="mt-4 text-center text-sm text-[#43474e] px-6">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="mt-6 flex items-center gap-2 text-[#43474e]/40">
          <GraduationCap className="text-sm" />
          <span className="text-xs font-medium tracking-widest uppercase">Secure Institutional Access</span>
        </div>
      </main>
    </div>
  )
}
