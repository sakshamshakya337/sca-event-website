import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, UserPlus, Code, Briefcase } from 'lucide-react'

export default function Team() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const teamMembers = [
    {
      name: 'Saksham Shakya',
      initials: 'SS',
      role: 'Full Stack',
      program: 'SCA - MCA'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 w-full h-[60px] z-50 bg-background border-b border-outline-variant flex justify-between items-center px-6 transition-all ${scrolled ? 'shadow-md' : ''}`}>
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/sca.png" alt="SCA Logo" className="h-14 w-auto" />
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-on-surface-variant text-sm hover:text-primary transition-colors" to="/about">
              About
            </Link>
            <Link className="text-on-surface-variant text-sm hover:text-primary transition-colors" to="/contact">
              Contact
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/portal"
            className="hidden md:flex bg-secondary text-on-secondary px-6 py-2 rounded-btn text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            Enter Portal
          </Link>
          <Menu className="text-on-surface cursor-pointer md:hidden" size={24} />
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="pt-[100px] pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl text-on-surface tracking-tight font-bold">
            Meet the Team
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            The student developers behind SCA EMS. We are dedicated to building a seamless management experience for the School of Computer Application.
          </p>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        </header>

        {/* Bento-Style/Grid Layout for Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member Cards */}
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-8 rounded-card shadow-sm hover:shadow-card transition-all duration-300 group flex flex-col items-center text-center bg-surface-card border border-outline-variant"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-4 ring-surface-card shadow-inner group-hover:scale-105 transition-transform bg-primary-container"
              >
                <span className="text-on-primary-container text-3xl font-bold">{member.initials}</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-1">{member.name}</h3>
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold mb-4">
                {member.role}
              </span>
              <p className="text-on-surface-variant font-mono text-xs mb-6">{member.program}</p>
              <div className="flex gap-4 mt-auto">
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                  <Code size={24} />
                </a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                  <Briefcase size={24} />
                </a>
              </div>
            </div>
          ))}

          {/* Join the team placeholder card */}
          <div
            className="md:col-span-2 p-8 rounded-card border-2 border-dashed border-outline-variant flex flex-col justify-center items-center text-center min-h-[300px] bg-surface-container"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
              <UserPlus className="text-on-surface-variant" size={36} />
            </div>
            <h4 className="text-lg font-semibold text-on-surface mb-2">Want to contribute?</h4>
            <p className="text-on-surface-variant text-sm max-w-md mb-6">
              SCA EMS is an open-source project managed by student volunteers. We are always looking for fresh perspectives in security, dev-ops, and data analytics.
            </p>
            <button className="border border-primary text-primary px-8 py-2 rounded-btn font-semibold hover:bg-primary hover:text-on-primary transition-all">
              View Contributors
            </button>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-32 pt-12 border-t border-outline-variant grid grid-cols-1 md:grid-cols-4 gap-12 text-on-surface-variant text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/sca.png" alt="SCA Logo" className="h-13 w-auto" />
            </div>
            <p className="max-w-sm mb-6">
              Streamlining event registration, scheduling, and management for the next generation of technologists at the School of Computer Application.
            </p>
            
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-4">Platform</h5>
            <ul className="space-y-2">
              <li className="hover:text-primary cursor-pointer">Documentation</li>
              <li className="hover:text-primary cursor-pointer">Shield</li>
              <li className="hover:text-primary cursor-pointer">Integrations</li>
              <li className="hover:text-primary cursor-pointer">Support</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-4">Legal</h5>
            <ul className="space-y-2">
              <li className="hover:text-primary cursor-pointer">Privacy Policy</li>
              <li className="hover:text-primary cursor-pointer">Terms of Service</li>
              <li className="hover:text-primary cursor-pointer">Cookie Settings</li>
            </ul>
          </div>
        </footer>
        <div className="text-center mt-12 text-xs text-on-surface-variant font-mono flex flex-col items-center gap-1">
          <p>© 2026 School of Computer Application.</p>
          <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-primary">Saksham shakya</a> | <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-primary">Portfolio</a></p>
        </div>
      </main>
    </div>
  )
}
