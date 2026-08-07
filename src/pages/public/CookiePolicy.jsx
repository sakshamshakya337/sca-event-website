import PublicLayout from '../../components/layout/PublicLayout'
import { Cookie, Shield, CheckCircle2, Info, Settings, FileText } from 'lucide-react'

export default function CookiePolicy() {
  return (
    <PublicLayout>
      <div className="bg-background min-h-screen py-12 px-6 font-sans text-on-surface">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold border border-outline-variant">
              <Cookie size={16} /> Web Cookie Policy & Transparency
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Cookie Policy
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Last updated: August 2026. Learn how the School of Computer Applications (LPU) uses cookies and local storage technology to provide a secure and seamless web application experience.
            </p>
          </div>

          {/* Core Content Blocks */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-8 text-on-surface text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Info size={20} className="text-primary" /> 1. What Are Cookies?
              </h2>
              <p className="text-on-surface-variant">
                Cookies are small data text files stored on your computer or mobile device when you visit web applications. They allow web systems to remember your authentication session, security permissions, user preferences, and app navigation state.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Shield size={20} className="text-primary" /> 2. Types of Cookies We Use
              </h2>

              <div className="grid gap-4">
                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 font-bold text-on-surface">
                    <CheckCircle2 size={18} className="text-primary" />
                    <span>Strictly Necessary Session Cookies</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Essential for secure user login, JWT token verification, rate limiting protections, and role-based navigation access (Student, Faculty, HOD, Dean, Admin).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 font-bold text-on-surface">
                    <CheckCircle2 size={18} className="text-secondary" />
                    <span>Performance & Analytics Cookies</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    We use Vercel Analytics to collect aggregated, anonymized usage statistics (page response times, system errors) to improve speed and user experience.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 font-bold text-on-surface">
                    <CheckCircle2 size={18} className="text-primary" />
                    <span>Functional Local Storage</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Stores transient UI preferences, theme states, PWA installation prompts, and offline data caches for event management.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Settings size={20} className="text-primary" /> 3. Managing Cookie Preferences
              </h2>
              <p className="text-on-surface-variant">
                Most modern web browsers allow you to control cookie settings through their preferences menu. However, disabling strictly necessary cookies may restrict access to authenticated areas such as event submissions, faculty approvals, and user dashboards.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-outline-variant">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText size={20} className="text-primary" /> 4. Contact Information
              </h2>
              <p className="text-on-surface-variant">
                If you have any questions regarding our Cookie Policy or data storage practices, please contact the SCA Web Development Team at{' '}
                <a href="mailto:sca.events@lpu.co.in" className="text-primary font-semibold hover:underline">
                  sca.events@lpu.co.in
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
