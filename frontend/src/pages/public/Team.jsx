import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, UserPlus, Github, Linkedin } from 'lucide-react'

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
    <div className="min-h-screen bg-[#f8fafc] text-[#171c1f] font-[Inter]">
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 w-full h-[60px] z-50 bg-[#f6fafe] border-b border-[#c4c6cf] flex justify-between items-center px-6 transition-all ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-[#43474e] text-sm hover:text-[#0051d5] transition-colors" to="/about">
              About
            </Link>
            <Link className="text-[#43474e] text-sm hover:text-[#0051d5] transition-colors" to="/contact">
              Contact
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/portal"
            className="hidden md:flex bg-[#022448] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all active:scale-95"
          >
            Enter Portal
          </Link>
          <Menu className="text-[#43474e] cursor-pointer md:hidden" size={24} />
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="pt-[100px] pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl text-[#022448] tracking-tight font-bold">
            Meet the Team
          </h1>
          <p className="text-[#43474e] text-lg max-w-2xl mx-auto">
            The student developers behind SCA EMS. We are dedicated to building a seamless management experience for the School of Computer Application.
          </p>
          <div className="w-16 h-1 bg-[#316bf3] mx-auto rounded-full"></div>
        </header>

        {/* Bento-Style/Grid Layout for Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member Cards */}
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-center text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-4 ring-white shadow-inner group-hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #022448 0%, #1e3a5f 100%)'
                }}
              >
                <span className="text-white text-3xl font-bold">{member.initials}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#022448] mb-1">{member.name}</h3>
              <span className="bg-[#dbe1ff] text-[#003ea8] px-3 py-1 rounded-full text-xs font-bold mb-4">
                {member.role}
              </span>
              <p className="text-[#74777f] font-[JetBrains Mono] text-xs mb-6">{member.program}</p>
              <div className="flex gap-4 mt-auto">
                <a href="#" className="text-[#74777f] hover:text-[#022448] transition-colors">
                  <Github size={24} />
                </a>
                <a href="#" className="text-[#74777f] hover:text-[#022448] transition-colors">
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
          ))}

          {/* Join the team placeholder card */}
          <div
            className="col-span-1 md:col-span-2 p-8 rounded-xl border-2 border-dashed flex flex-col justify-center items-center text-center min-h-[300px]"
            style={{
              background: 'rgba(240, 244, 248, 0.3)',
              borderColor: '#c4c6cf'
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#e4e9ed] flex items-center justify-center mb-4">
              <UserPlus className="text-[#74777f]" size={36} />
            </div>
            <h4 className="text-lg font-semibold text-[#022448] mb-2">Want to contribute?</h4>
            <p className="text-[#43474e] text-sm max-w-md mb-6">
              SCA EMS is an open-source project managed by student volunteers. We are always looking for fresh perspectives in security, dev-ops, and data analytics.
            </p>
            <button className="border border-[#022448] text-[#022448] px-8 py-2 rounded-lg font-semibold hover:bg-[#022448] hover:text-white transition-all">
              View Contributors
            </button>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-32 pt-12 border-t border-[#c4c6cf] grid grid-cols-1 md:grid-cols-4 gap-12 text-[#43474e] text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
            </div>
            <p className="max-w-sm mb-6">
              Streamlining event registration, scheduling, and management for the next generation of technologists at the School of Computer Application.
            </p>
            
          </div>
          <div>
            <h5 className="font-bold text-[#022448] mb-4">Platform</h5>
            <ul className="space-y-2">
              <li className="hover:text-[#0051d5] cursor-pointer">Documentation</li>
              <li className="hover:text-[#0051d5] cursor-pointer">Shield</li>
              <li className="hover:text-[#0051d5] cursor-pointer">Integrations</li>
              <li className="hover:text-[#0051d5] cursor-pointer">Support</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[#022448] mb-4">Legal</h5>
            <ul className="space-y-2">
              <li className="hover:text-[#0051d5] cursor-pointer">Privacy Policy</li>
              <li className="hover:text-[#0051d5] cursor-pointer">Terms of Service</li>
              <li className="hover:text-[#0051d5] cursor-pointer">Cookie Settings</li>
            </ul>
          </div>
        </footer>
        <div className="text-center mt-12 text-xs text-[#74777f] font-[JetBrains Mono] flex flex-col items-center gap-1">
          <p>© 2026 School of Computer Application.</p>
          <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-[#0051d5]">Saksham shakya</a> | <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-[#0051d5]">Portfolio</a></p>
        </div>
      </main>
    </div>
  )
}