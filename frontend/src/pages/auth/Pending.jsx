import { Link } from 'react-router-dom'
import { Clock, Home, Mail } from 'lucide-react'

export default function Pending() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 sm:p-6 font-[Inter]">
      <main className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-lg p-8 sm:p-10 text-center">

          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <Clock className="text-amber-500" size={32} />
          </div>

          {/* Logo */}
          <img src="/sca.png" alt="SCA" className="h-10 w-auto mx-auto mb-4 opacity-70" />

          <h1 className="text-xl sm:text-2xl font-bold text-[#022448] mb-3">
            Account Pending Approval
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 leading-relaxed px-2">
            Your account is being reviewed by an administrator. You'll receive a confirmation once it's approved.
          </p>

          {/* Steps */}
          <div className="text-left bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 mb-6 sm:mb-8 space-y-3">
            {[
              { icon: '1', text: 'Your application has been submitted' },
              { icon: '2', text: 'Admin will verify your documents' },
              { icon: '3', text: 'You\'ll get access once approved' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {icon}
                </div>
                <p className="text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
            <Mail size={14} />
            <span>Questions? Email </span>
            <a href="mailto:sca@lpu.edu.in" className="text-primary font-medium hover:underline">
              sca@lpu.edu.in
            </a>
          </div>

          {/* Back button */}
          <Link
            to="/"
            className="w-full py-3 px-6 bg-primary text-on-primary font-semibold rounded-btn hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          SCA Institutional Portal © 2026
        </p>
      </main>
    </div>
  )
}
