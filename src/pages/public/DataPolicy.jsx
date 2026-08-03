import { Link } from 'react-router-dom'
import { Database, Server, Cpu, ShieldAlert, History, FileSpreadsheet, CheckCircle } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

export default function DataPolicy() {
  const lastUpdated = "August 1, 2026"

  const dataSections = [
    {
      id: "architecture",
      icon: <Server className="w-5 h-5 text-primary" />,
      title: "1. Data Architecture & Infrastructure Overview",
      content: `The SCA Event Management System operates a modern cloud data infrastructure engineered for reliability, high availability, and security.

• Database Management: User profiles, event manifests, tasks, and registration queues are managed in MongoDB Atlas with automated failover and daily point-in-time snapshots.
• File Assets & Media: Event banner media, certificates, and profile photos are securely stored and optimized via Cloudinary CDN using access-controlled tokens.
• API Services: Application logic is executed through Node.js/Express server microservices with TLS encryption applied across all communication layers.`
    },
    {
      id: "records",
      icon: <FileSpreadsheet className="w-5 h-5 text-primary" />,
      title: "2. Event Records & Certificate Verification",
      content: `Maintaining accurate, tamper-evident records of student participation and certifications is a foundational objective of SCA EMS.

• Certificate Unique IDs: Every e-certificate issued through the platform bears a unique verification hash to prevent forgery.
• Registration Queues: Registration records retain timestamp logs of submission, coordinator approval, and attendance confirmation.
• Historical Analytics: Departmental statistics (event count, student participation rate, faculty coordination metrics) are aggregated for semester audit reports.`
    },
    {
      id: "logging",
      icon: <History className="w-5 h-5 text-primary" />,
      title: "3. System Logging & Audit Trails",
      content: `To ensure operational integrity and compliance with university IT policies, automated logging mechanisms are active across the platform:

• Access Logs: Administrative actions (user verification, role elevation, event approvals) generate immutable audit logs.
• Rate Limiting Logs: Security middleware tracks API request velocity to mitigate brute-force attempts and denial-of-service vectors.
• Exception Monitoring: Error diagnostics are logged silently without capturing unencrypted sensitive user passwords or token keys.`
    },
    {
      id: "backup",
      icon: <Cpu className="w-5 h-5 text-primary" />,
      title: "4. Backup & Disaster Recovery",
      content: `Data resilience measures protect system state against hardware failures or accidental data corruption:

• Daily Backups: Full database backups are performed automatically every 24 hours.
• Redundant Storage: Media assets are mirrored across geographically distributed CDN edge nodes.
• Disaster Recovery Testing: Periodic backup restoration drills are conducted by the SCA Technical Team to guarantee RTO (Recovery Time Objective) under 2 hours.`
    },
    {
      id: "requests",
      icon: <ShieldAlert className="w-5 h-5 text-primary" />,
      title: "5. Data Erasure & Transfer Requests",
      content: `Students and faculty members may request summaries of their stored personal records or submit data modification inquiries.

• Account Deactivation: Upon graduation or leaving LPU, user accounts may be archived. Academic event records and certificates remain indexed in the university archive for alumni verification.
• Deletion Requests: Formal requests for personal data removal will be processed in accordance with LPU Academic Regulations.`
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
                Technical Governance
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight text-on-surface font-extrabold tracking-tight mt-1">
              Data Policy
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Technical standards, data retention guidelines, storage safety, and audit controls powering the School of Computer Application platform.
            </p>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Main Sections */}
          <div className="lg:col-span-8 space-y-6">
            {dataSections.map((sec) => (
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
                  <Database size={16} className="text-primary" />
                  Data Index
                </h3>
                <nav className="flex flex-col gap-2 text-xs">
                  {dataSections.map((sec) => (
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

              {/* Data Integrity Box */}
              <div className="bg-surface-container border border-outline-variant rounded-card p-6">
                <h4 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" />
                  Data Protection Compliance
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  All databases are operated in accordance with LPU IT Security Cell rules and ISO/IEC 27001 data management protocols.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Contact Data Cell &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
