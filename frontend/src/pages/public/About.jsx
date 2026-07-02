import { Link } from 'react-router-dom'
import { Code, Zap, Palette, Database, Laptop, Terminal } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

export default function About() {
  return (
    <PublicLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Page Header */}
        <header className="mb-8 sm:mb-12 border-b border-outline-variant pb-6 sm:pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-primary font-semibold tracking-wider text-xs uppercase">
              School of Computer Applications — LPU
            </span>
            <h1 className="text-3xl sm:text-[42px] leading-tight text-on-surface font-extrabold tracking-tight">
              About This System
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-8 sm:gap-12">
          {/* LEFT COLUMN (60%) */}
          <div className="md:col-span-6 space-y-8 sm:space-y-10">
            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full shrink-0"></span>
                What is SCA EMS?
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                The SCA Event Management System is an internal platform built exclusively for the School of Computer Application at Lovely Professional University. It centralizes event organization, role assignment, task management and progress tracking under a single secure interface.
              </p>
            </section>

            <blockquote className="border-l-4 border-primary pl-5 sm:pl-6 py-4 bg-surface-container rounded-r-xl italic text-on-surface-variant font-medium text-sm sm:text-base">
              "Built to replace scattered spreadsheets and WhatsApp groups with a structured, role-aware platform every SCA member can trust."
            </blockquote>

            <section className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-on-surface flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full shrink-0"></span>
                Why We Built It
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Managing 50+ events per semester across faculty and 3,000+ students required a dedicated system. SCA EMS was created to fill that gap. By digitizing workflows, we ensure that administrative overhead is reduced, allowing faculty and students to focus on technical excellence rather than logistical hurdles.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="p-4 bg-surface-container rounded-card border border-outline-variant">
                  <span className="block text-xl sm:text-2xl font-bold text-on-surface">50+</span>
                  <span className="text-xs text-on-surface-variant">Events per Semester</span>
                </div>
                <div className="p-4 bg-surface-container rounded-card border border-outline-variant">
                  <span className="block text-xl sm:text-2xl font-bold text-on-surface">3,000+</span>
                  <span className="text-xs text-on-surface-variant">Active Students</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (40%) — no sticky on mobile */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-[80px]">
              <div className="bg-surface-card border border-outline-variant rounded-card p-6 sm:p-8 shadow-card">
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-sm font-semibold text-on-surface mb-1">Tech Stack</h3>
                  <p className="text-xs text-on-surface-variant">Core infrastructure powering the platform</p>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {[
                    { icon: <Code size={18} />, label: 'React', ver: 'v18.2', color: 'bg-primary-container/10 text-primary' },
                    { icon: <Zap size={18} />, label: 'Vite', ver: 'v5.0', color: 'bg-secondary-container/10 text-secondary' },
                    { icon: <Palette size={18} />, label: 'TailwindCSS', ver: 'v3.4', color: 'bg-tertiary-container/10 text-tertiary' },
                    { icon: <Database size={18} />, label: 'MongoDB', ver: 'LATEST', color: 'bg-primary/10 text-primary' },
                    { icon: <Laptop size={18} />, label: 'Express.js', ver: 'v4.18', color: 'bg-on-surface/10 text-on-surface' },
                    { icon: <Terminal size={18} />, label: 'Node.js', ver: 'v18.x', color: 'bg-secondary-container/10 text-secondary' },
                  ].map(({ icon, label, ver, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-3 rounded-btn border border-outline-variant hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded ${color} shrink-0`}>
                          {icon}
                        </div>
                        <span className="text-sm text-on-surface font-semibold">{label}</span>
                      </div>
                      <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                        {ver}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-outline-variant">
                  <div className="flex items-center gap-3">
                    <img src="/sca.png" alt="SCA Logo" className="h-11 sm:h-12 w-auto opacity-50 grayscale" />
                    <div className="text-xs leading-tight font-medium text-on-surface-variant">
                      School of Computer<br />Applications
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
