import { Link } from 'react-router-dom'
import { FileText, ShieldCheck, UserCheck, AlertCircle, Scale, CheckCircle2, HelpCircle } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

export default function TermsOfUse() {
  const lastUpdated = "August 1, 2026"

  const sections = [
    {
      id: "acceptance",
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: "1. Acceptance of Terms",
      content: `By accessing or using the School of Computer Application Event Management System (SCA EMS), accessible via our website and platform, you agree to be bound by these Terms of Use, our Privacy Policy, and all applicable university policies of Lovely Professional University (LPU). If you do not agree to these terms, please do not use the platform.`
    },
    {
      id: "eligibility",
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: "2. User Eligibility & Account Registration",
      content: `SCA EMS is designed for registered students, faculty members, heads of departments, and administrators affiliated with the School of Computer Application at LPU.

• Account Authenticity: You must register using your official university credentials (LPU Registration ID / Employee ID and official email address).
• Credential Safety: You are responsible for keeping your password secure. Any activity occurring under your account is your responsibility.
• Unauthorized Access: Impersonating another student or faculty member is strictly prohibited and will result in immediate suspension and disciplinary action by the university.`
    },
    {
      id: "conduct",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: "3. Code of Conduct & Platform Usage",
      content: `When engaging with SCA EMS, including registering for events, uploading materials, or posting inquiries, you agree to uphold academic integrity and professional ethics.

You agree NOT to:
• Upload misleading, abusive, obscene, or copyright-violating content.
• Attempt to bypass authentication controls, rate limits, or administrative verification filters.
• Solicit unauthorized access or harvest private student/faculty contact details.
• Use automated scripts, bots, or scraping tools against system APIs.`
    },
    {
      id: "events",
      icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
      title: "4. Event Registration & Attendance Policy",
      content: `Event registrations submitted via SCA EMS constitute a formal commitment to participate.

• Attendance Tracking: Event organizers use QR and digital check-ins to monitor attendance. Fraudulent check-in attempts will invalidate certificates.
• Certificates of Participation: E-certificates are issued solely to registered attendees who meet mandatory completion thresholds.
• Cancellation: If you are unable to attend an event you registered for, you must cancel your registration at least 24 hours prior to the scheduled start time.`
    },
    {
      id: "ip",
      icon: <Scale className="w-5 h-5 text-primary" />,
      title: "5. Intellectual Property Rights",
      content: `All design elements, code, branding assets (SCA & LPU logos), graphics, and software interface components of SCA EMS are the property of the School of Computer Application, LPU. 

Event presentation materials uploaded by guest speakers or faculty remain the intellectual property of their respective creators and are provided for educational use within LPU.`
    },
    {
      id: "liability",
      icon: <AlertCircle className="w-5 h-5 text-primary" />,
      title: "6. Limitation of Liability & Service Availability",
      content: `SCA EMS is provided on an "as is" and "as available" basis. While we strive for 99.9% uptime, we do not guarantee uninterrupted operation during scheduled system upgrades or network maintenance.

The School of Computer Application is not liable for indirect or consequential disruption resulting from server downtime or external network failures.`
    },
    {
      id: "amendments",
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      title: "7. Modifications & Inquiries",
      content: `We reserve the right to modify these Terms of Use at any time. Notice of significant changes will be broadcasted via system notifications or displayed on the homepage.

For questions regarding these terms, contact the SCA Administrative Office at sca.events@lpu.co.in or visit the Contact page.`
    }
  ]

  return (
    <PublicLayout>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-10 sm:mb-12 border-b border-outline-variant pb-6 sm:pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-primary font-semibold tracking-wider text-xs uppercase bg-primary-container/20 px-3 py-1 rounded-full">
                Legal & Governance
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight text-on-surface font-extrabold tracking-tight mt-1">
              Terms of Use
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Rules and regulations governing user access, event registration, and account conduct on the School of Computer Application Event Management System.
            </p>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Main Sections */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((sec) => (
              <div 
                key={sec.id}
                id={sec.id}
                className="bg-surface-card border border-outline-variant rounded-card p-6 sm:p-7 shadow-sm hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-container/10 border border-primary/20">
                    {sec.icon}
                  </div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line pl-1 sm:pl-2 border-l-2 border-primary/30 mt-3">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[85px] space-y-6">
              {/* Table of Contents */}
              <div className="bg-surface-card border border-outline-variant rounded-card p-6 shadow-sm">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Quick Navigation
                </h3>
                <nav className="flex flex-col gap-2 text-xs">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all py-1 border-b border-outline-variant/30 last:border-0"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Support Card */}
              <div className="bg-surface-container border border-outline-variant rounded-card p-6">
                <h4 className="text-sm font-bold text-on-surface mb-2">Need Clarification?</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  If you have questions about our policies or student guidelines, reach out to our administration.
                </p>
                <Link
                  to="/contact"
                  className="w-full bg-primary text-on-primary text-xs font-semibold py-2.5 px-4 rounded-btn flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  Contact SCA Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
