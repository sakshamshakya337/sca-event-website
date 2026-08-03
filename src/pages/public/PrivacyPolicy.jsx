import { Link } from 'react-router-dom'
import { Shield, Eye, Lock, Database, UserCheck, HardDrive, FileCheck2 } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

export default function PrivacyPolicy() {
  const lastUpdated = "August 1, 2026"

  const privacySections = [
    {
      id: "collection",
      icon: <Eye className="w-5 h-5 text-primary" />,
      title: "1. Information We Collect",
      content: `SCA EMS collects necessary information to verify identity, manage event participation, and maintain academic records within Lovely Professional University.

• Profile Information: Student/Faculty Registration ID, First & Last Name, Official LPU Email, Department, Contact Number, and optional profile photo.
• Event Registrations: Event sign-ups, workshop choices, team submission details, and attendance logs.
• System Logs: IP address, browser user-agent, session tokens, and timestamp audit logs recorded during login and security events.`
    },
    {
      id: "usage",
      icon: <Database className="w-5 h-5 text-primary" />,
      title: "2. How We Use Your Information",
      content: `Your data is strictly processed for legitimate academic and event management purposes:

• Event Operations: Issuing digital event tickets, verifying attendance, forming workshop teams, and sending event notifications.
• Certification: Generating official certificates of achievement or participation signed by HOD/Dean.
• Academic Reporting: Providing aggregated event analytics and participation statistics to university leadership.
• System Security: Detecting failed login attempts, unauthorized API calls, and protecting user privacy.`
    },
    {
      id: "sharing",
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: "3. Information Sharing & Disclosure",
      content: `We prioritize your privacy and do NOT sell, rent, or commercialize student or faculty data to third-party marketers.

• Internal University Access: Authorized faculty coordinators, HODs, and administrators access relevant student rosters solely for event execution and grading/credits.
• Service Infrastructure: Technical data may pass securely through hosted infrastructure providers (Vercel, Cloudinary for avatar images, MongoDB Atlas) operating under strict data protection agreements.
• Legal Compliance: Data may be disclosed if required by law or university legal directives.`
    },
    {
      id: "cookies",
      icon: <Lock className="w-5 h-5 text-primary" />,
      title: "4. Cookies & Local Storage",
      content: `SCA EMS utilizes session tokens and secure browser storage to keep you logged in seamlessly across sessions.

• Essential Tokens: Encrypted JWT auth tokens stored in local storage for session authorization.
• Preferences: UI theme and state cache stored locally to improve responsiveness.
• No Tracking Cookies: We do not employ third-party advertising or cross-site tracking cookies.`
    },
    {
      id: "security",
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: "5. Data Security Standards",
      content: `We implement industry-standard administrative, technical, and physical security controls to safeguard your data:

• TLS Encryption: All transit data is encrypted using HTTPS/TLS protocols.
• Role-Based Access Control (RBAC): Strict permission boundaries prevent unauthorized role privilege escalation.
• Password Protection: User passwords are stored using salted cryptographic hashing (bcrypt).`
    },
    {
      id: "retention",
      icon: <HardDrive className="w-5 h-5 text-primary" />,
      title: "6. Data Retention & Archival",
      content: `Active student and event records are maintained throughout the duration of your academic tenure at LPU.

Event participation history and certificates remain accessible in your student portal for official verification purposes even after graduation unless removal is formally requested.`
    },
    {
      id: "rights",
      icon: <FileCheck2 className="w-5 h-5 text-primary" />,
      title: "7. Your Privacy Rights & Contact",
      content: `You have the right to inspect your registered profile data, request corrections to inaccurate records, and view your complete event attendance history.

If you have privacy concerns or wish to request data updates, please contact the SCA Privacy & Systems Coordinator at sca.privacy@lpu.co.in or submit a query through our Contact page.`
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
                Privacy Protection
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight text-on-surface font-extrabold tracking-tight mt-1">
              Privacy Policy
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              How the School of Computer Application collects, uses, protects, and handles user information across the event platform.
            </p>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Main Sections */}
          <div className="lg:col-span-8 space-y-6">
            {privacySections.map((sec) => (
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
              {/* Quick nav */}
              <div className="bg-surface-card border border-outline-variant rounded-card p-6 shadow-sm">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  Privacy Index
                </h3>
                <nav className="flex flex-col gap-2 text-xs">
                  {privacySections.map((sec) => (
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

              {/* Data Commitment Badge */}
              <div className="bg-primary-container/10 border border-primary/30 rounded-card p-6">
                <h4 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  Zero Commercial Data Selling
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your academic records, attendance history, and personal details remain strictly internal to LPU operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
