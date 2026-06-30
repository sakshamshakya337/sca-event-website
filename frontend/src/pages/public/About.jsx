import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu, Code, Zap, Palette, Database, Server, Terminal } from 'lucide-react'

export default function About() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-[#f6fafe] min-h-screen text-[#171c1f] font-[Inter]">
      {/* Public TopAppBar */}
      <nav className={`fixed top-0 w-full h-[60px] z-50 backdrop-blur-md flex justify-between items-center px-6 transition-all duration-300 ${scrolled ? 'bg-[#f6fafe] shadow-md' : 'bg-[#f6fafe]/90'}`}>
        <Link to="/" className="flex items-center gap-3">
          <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link className="text-[#43474e] font-medium hover:text-[#0051d5] transition-colors" to="/about">About</Link>
          <Link className="text-[#43474e] font-medium hover:text-[#0051d5] transition-colors" to="/events">Events</Link>
          <Link className="text-[#43474e] font-medium hover:text-[#0051d5] transition-colors" to="/contact">Contact</Link>
          <Link to="/portal" className="bg-[#0051d5] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#003ea8] active:scale-95 transition-all">
            Enter Portal
            <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden text-[#171c1f]">
          <Menu size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="pt-[60px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          {/* Page Header */}
          <header className="mb-12 border-b border-[#c4c6cf] pb-8">
            <div className="flex flex-col gap-2">
              <span className="text-[#0051d5] font-semibold tracking-wider text-xs uppercase">School of Computer Applications — LPU</span>
              <h1 className="text-[42px] leading-tight text-[#022448] font-extrabold tracking-tight">About This System</h1>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-10 gap-12">
            {/* LEFT COLUMN (60%) */}
            <div className="md:col-span-6 space-y-10">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#022448] flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#316bf3] rounded-full"></span>
                  What is SCA EMS?
                </h2>
                <p className="text-sm text-[#43474e] leading-relaxed">
                  The SCA CalendarDays Management System is an internal platform built exclusively for the School of Computer Application at Lovely Professional University. It centralizes event organization, role assignment, task management and progress tracking under a single secure interface.
                </p>
              </section>

              <blockquote className="border-l-4 border-[#022448] pl-6 py-4 bg-[#f0f4f8] rounded-r-xl italic text-[#2d486d] font-medium">
                "Built to replace scattered spreadsheets and WhatsApp groups with a structured, role-aware platform every SCA member can trust."
              </blockquote>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#022448] flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#316bf3] rounded-full"></span>
                  Why We Built It
                </h2>
                <p className="text-sm text-[#43474e] leading-relaxed">
                  Managing 50+ events per semester across faculty and 3,000+ students required a dedicated system. SCA EMS was created to fill that gap. By digitizing workflows, we ensure that administrative overhead is reduced, allowing faculty and students to focus on technical excellence rather than logistical hurdles.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-[#eaeef2] rounded-xl border border-[#c4c6cf]">
                    <span className="block text-lg font-bold text-[#022448]">50+</span>
                    <span className="text-xs text-[#43474e]">Events per Semester</span>
                  </div>
                  <div className="p-4 bg-[#eaeef2] rounded-xl border border-[#c4c6cf]">
                    <span className="block text-lg font-bold text-[#022448]">3,000+</span>
                    <span className="text-xs text-[#43474e]">Active Students</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN (40%) */}
            <div className="md:col-span-4">
              <div className="sticky top-[100px]">
                <div className="bg-white border border-[#c4c6cf] rounded-xl p-8 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#022448] mb-1">Tech Stack</h3>
                    <p className="text-xs text-[#43474e]">Core infrastructure powering the platform</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {/* BadgeCheck: React */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#61DAFB]/10 text-[#61DAFB] flex items-center justify-center rounded">
                          <Code size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">React</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">v18.2</span>
                    </div>
                    {/* BadgeCheck: Vite */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#646CFF]/10 text-[#646CFF] flex items-center justify-center rounded">
                          <Zap size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">Vite</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">v5.0</span>
                    </div>
                    {/* BadgeCheck: TailwindCSS */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center rounded">
                          <Palette size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">TailwindCSS</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">v3.4</span>
                    </div>
                    {/* BadgeCheck: Firebase */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FFCA28]/10 text-[#FFCA28] flex items-center justify-center rounded">
                          <Database size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">Firebase</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">LATEST</span>
                    </div>
                    {/* BadgeCheck: Express */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#000000]/10 text-[#000000] flex items-center justify-center rounded">
                          <Server size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">Express.js</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">v4.18</span>
                    </div>
                    {/* BadgeCheck: Node.js */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6cf] transition-all hover:-translate-y-1 hover:shadow-sm cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#339933]/10 text-[#339933] flex items-center justify-center rounded">
                          <Terminal size={20} />
                        </div>
                        <span className="text-sm text-[#022448] font-semibold">Node.js</span>
                      </div>
                      <span className="font-[JetBrains Mono] text-xs bg-[#eaeef2] px-2 py-0.5 rounded text-[#43474e]">v18.x</span>
                    </div>
                  </div>

                  {/* Branding Decoration */}
                  <div className="mt-8 pt-8 border-t border-[#c4c6cf]">
                    <div className="flex items-center gap-3">
                      <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto opacity-60 grayscale" />
                      <div className="text-xs leading-tight font-medium text-[#43474e]">
                        School of Computer<br />Applications
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-16 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/sca-white.png" alt="SCA Logo" className="h-10 w-auto" />
              </div>
              <p className="text-[#8aa4cf] max-w-sm">
                Dedicated to enhancing the event management experience for the School of Computer Application at Lovely Professional University.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-white">Quick Links</h5>
              <ul className="space-y-4 text-[#8aa4cf]">
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="/about">About</Link></li>
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="/contact">Contact</Link></li>
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="/portal">Faculty Portal</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-white">Legal</h5>
              <ul className="space-y-4 text-[#8aa4cf]">
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="#">Terms of Use</Link></li>
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="#">Privacy Policy</Link></li>
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="#">LPU Guidelines</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[#8aa4cf] text-xs">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p>© 2026 SCA EMS — School of Computer Application, LPU. All Rights Reserved.</p>
              <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Saksham shakya</a></p>
            </div>           
          </div>
        </div>
      </footer>
    </div>
  )
}