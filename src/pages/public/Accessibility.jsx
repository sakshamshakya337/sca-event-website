import PublicLayout from '../../components/layout/PublicLayout'
import { Accessibility as AccessibilityIcon, Eye, Keyboard, Monitor, HeartHandshake, Mail } from 'lucide-react'

export default function Accessibility() {
  return (
    <PublicLayout>
      <div className="bg-background min-h-screen py-12 px-6 font-sans text-on-surface">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold border border-outline-variant">
              <AccessibilityIcon size={16} /> Web Accessibility Standard (WCAG 2.1)
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
              Accessibility Statement
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              The School of Computer Applications at Lovely Professional University is dedicated to ensuring digital accessibility for people with disabilities and all community members.
            </p>
          </div>

          {/* Commitment Grid */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-8 text-on-surface text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <HeartHandshake size={20} className="text-primary" /> Our Accessibility Commitment
              </h2>
              <p className="text-on-surface-variant">
                We strive to continually improve the user experience for everyone, applying relevant Web Content Accessibility Guidelines (WCAG 2.1 Level AA standards) across our event platform, portal gateways, document viewers, and interactive components.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Monitor size={20} className="text-primary" /> Key Accessibility Features
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 font-bold text-on-surface">
                    <Keyboard size={18} className="text-primary" />
                    <span>Keyboard Navigation</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Full keyboard navigation support with visible focus indicators for buttons, links, forms, and interactive tabs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 font-bold text-on-surface">
                    <Eye size={18} className="text-secondary" />
                    <span>Color Contrast & Typography</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    High contrast color ratios (WCAG compliant) and responsive, legible typography scaled across screen sizes.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Mail size={20} className="text-primary" /> Feedback & Assistance
              </h2>
              <p className="text-on-surface-variant">
                We welcome your feedback on the accessibility of the SCA Event Website. If you encounter accessibility barriers or need assistance accessing any content:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-on-surface-variant pl-2">
                <li>Email: <a href="mailto:sca.events@lpu.co.in" className="text-primary font-semibold underline">sca.events@lpu.co.in</a></li>
                <li>University Phone: +91 (1824) 404404</li>
                <li>Location: School of Computer Applications, Block 34, Lovely Professional University</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
