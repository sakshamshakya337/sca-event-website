import { Link } from 'react-router-dom'
import { Scale, HeartHandshake, ShieldCheck, AlertTriangle, Building2, PhoneCall, Mail, ExternalLink } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

export default function LegalAid() {
  const lastUpdated = "August 1, 2026"

  const legalAidSections = [
    {
      id: "assistance",
      icon: <Scale className="w-5 h-5 text-primary" />,
      title: "1. Institutional Legal Assistance & Student Rights",
      content: `Lovely Professional University (LPU) and the School of Computer Application are dedicated to providing a fair, transparent, and supportive academic environment for all students and faculty members.

• Rights Awareness: Every student has the right to equal treatment, protection against harassment, fair evaluation, and access to university grievance cells.
• Legal Guidance: The University Legal Advisory Cell offers confidential preliminary advice and support to students facing legal or administrative challenges.`
    },
    {
      id: "sgrc",
      icon: <HeartHandshake className="w-5 h-5 text-primary" />,
      title: "2. Student Grievance Redressal Committee (SGRC)",
      content: `If you encounter unfair treatment, discrimination, or procedural discrepancies during events or academic activities, the University provides structured escalation paths:

• Step 1 — Departmental Review: Submit an informal grievance to the SCA Faculty Advisor or Head of School (HOS).
• Step 2 — Formal Escalation: Lodge a formal written petition to the SGRC panel.
• Step 3 — Student Welfare Cell: Contact the Division of Student Welfare (DSW) for immediate counseling or mediation.`
    },
    {
      id: "cybersafety",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: "3. Cyber Safety & Anti-Harassment Guidelines",
      content: `SCA EMS upholds strict zero-tolerance policies regarding online bullying, unauthorized data dissemination, or harassment across event communication channels.

• Prohibition of Cyberbullying: Intimidation, derogatory remarks, or non-consensual sharing of student photos in event chats will result in instant expulsion from the platform and referral to the LPU Proctorial Board.
• Protection of Female Students: Complaints regarding gender discrimination or harassment are routed directly to the Internal Complaints Committee (ICC) as per Statutory Regulations.`
    },
    {
      id: "academic-integrity",
      icon: <AlertTriangle className="w-5 h-5 text-primary" />,
      title: "4. Intellectual Property & Academic Honesty",
      content: `Hackathons, coding competitions, and project showcases hosted on SCA EMS require strict adherence to academic integrity and copyright compliance.

• Original Work Guarantee: Code repositories and event submissions must be original or appropriately cited.
• Plagiarism Checks: Competition entries are subjected to automated originality checks. Submissions found violating third-party licenses will be disqualified.`
    }
  ]

  const emergencyContacts = [
    {
      title: "Division of Student Welfare (DSW)",
      phone: "+91 1824 517000",
      email: "dsw@lpu.co.in",
      location: "Block 13, LPU Campus"
    },
    {
      title: "SCA Administrative Office",
      phone: "+91 1824 517120",
      email: "sca.admin@lpu.co.in",
      location: "Block 34, School of Computer Application"
    },
    {
      title: "LPU Internal Complaints Committee (ICC)",
      phone: "+91 1824 517055",
      email: "icc@lpu.co.in",
      location: "Block 14, Administrative Block"
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
                Student Support & Protection
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Updated: {lastUpdated}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight text-on-surface font-extrabold tracking-tight mt-1">
              Legal Aid & Grievance Guidelines
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
              Institutional legal support, grievance redressal mechanisms, cyber safety standards, and student protection policies at Lovely Professional University.
            </p>
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Main Sections */}
          <div className="lg:col-span-8 space-y-6">
            {legalAidSections.map((sec) => (
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

            {/* Emergency Contacts Block */}
            <div className="bg-surface-card border border-outline-variant rounded-card p-6 sm:p-7 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Institutional Support & Legal Assistance Contacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.title} className="p-4 bg-surface-container border border-outline-variant/60 rounded-xl space-y-2">
                    <h3 className="text-xs font-bold text-on-surface leading-snug">{contact.title}</h3>
                    <div className="text-xs text-on-surface-variant space-y-1">
                      <p className="flex items-center gap-1.5">
                        <PhoneCall size={13} className="text-primary shrink-0" />
                        <span>{contact.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail size={13} className="text-primary shrink-0" />
                        <a href={`mailto:${contact.email}`} className="hover:underline text-primary truncate">{contact.email}</a>
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/40">
                        {contact.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[85px] space-y-6">
              {/* Quick nav */}
              <div className="bg-surface-card border border-outline-variant rounded-card p-6 shadow-sm">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Scale size={16} className="text-primary" />
                  Legal Aid Index
                </h3>
                <nav className="flex flex-col gap-2 text-xs">
                  {legalAidSections.map((sec) => (
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

              {/* Immediate Helpline Card */}
              <div className="bg-primary text-on-primary rounded-card p-6 shadow-md">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <PhoneCall size={16} />
                  LPU Emergency Helpline
                </h4>
                <p className="text-xs opacity-90 leading-relaxed mb-4">
                  For immediate campus safety assistance or proctorial support, call the 24/7 security control room.
                </p>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-center font-mono text-sm font-bold tracking-wider">
                  +91 1824 517000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
