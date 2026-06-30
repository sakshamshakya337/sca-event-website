import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu } from 'lucide-react'
import { MdSend, MdVerified, MdCheckCircle, MdRefresh, MdMail, MdPublic, MdHelp } from 'react-icons/md'
import api from '../../config/axios'

export default function Contact() {
  const [scrolled, setScrolled] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    universityId: '',
    role: 'Student',
    category: 'Event Query',
    subject: '',
    message: ''
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        universityId: formData.universityId,
        role: formData.role,
        category: formData.category,
        subject: formData.subject,
        message: formData.message
      })
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        universityId: '',
        role: 'Student',
        category: 'Event Query',
        subject: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to send query')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#f6fafe] text-[#171c1f] font-[Inter]">
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
      {/* Main Content */}
      <main className="pt-[60px] min-h-screen flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-[600px] bg-white rounded-xl border border-[#c4c6cf] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-[#c4c6cf]">
            <h1 className="text-[32px] text-[#022448] mb-1 font-bold">Contact Us</h1>
            <p className="text-sm text-[#43474e]">Have a question or issue? We'll get back to you shortly.</p>
          </div>
          {/* Contact Form */}
          <form className="p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-semibold ${
                    focusedField === 'name' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
                >
                  Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              {/* Mail Field */}
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-semibold ${
                    focusedField === 'email' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
                >
                  Mail
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* University ID */}
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-semibold ${
                    focusedField === 'id' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
                >
                  University ID
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm"
                    type="text"
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    onFocus={() => setFocusedField('id')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <MdVerified className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43474e]" size={18} />
                </div>
              </div>
              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-xs font-semibold ${
                    focusedField === 'role' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
                >
                  Role
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                >
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>Administrator</option>
                  <option>Guest</option>
                </select>
              </div>
            </div>
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs font-semibold ${
                  focusedField === 'category' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
              >
                Category
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                onFocus={() => setFocusedField('category')}
                onBlur={() => setFocusedField(null)}
              >
                <option>Event Query</option>
                <option>Technical Issue</option>
                <option>Registration Dispute</option>
                <option>Feedback</option>
              </select>
            </div>
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs font-semibold ${
                  focusedField === 'subject' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
              >
                Subject
              </label>
              <input
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs font-semibold ${
                  focusedField === 'message' ? 'text-[#0051d5]' : 'text-[#43474e]'
                  }`}
              >
                Message
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#c4c6cf] focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 transition-all text-sm resize-none"
                placeholder="Type your detailed message here..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
              ></textarea>
            </div>
            {/* Submit Button */}
            <button
              className="mt-2 w-full bg-[#0051d5] hover:bg-[#003ea8] text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70"
              disabled={isSubmitting || isSubmitted}
            >
              {isSubmitting ? (
                <>
                  <MdRefresh className="animate-spin" size={20} /> Sending...
                </>
              ) : isSubmitted ? (
                <>
                  <MdCheckCircle size={20} /> Message Sent!
                </>
              ) : (
                <>
                  Submit Query <MdSend size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        {/* Secondary Contact Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#43474e] flex items-center justify-center gap-2">
            Or reach us at:
            <a
              className="text-[#0051d5] font-bold hover:underline decoration-2 underline-offset-4 flex items-center gap-1 transition-all"
              href="mailto:sca@lpu.edu.in"
            >
              <MdMail size={18} />
              sca@lpu.edu.in
            </a>
          </p>
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
              <p>© 2026 SCA — School of Computer Application, LPU. All Rights Reserved.</p>
              <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Saksham shakya</a></p>
            </div>
           
          </div>
        </div>
      </footer>
    </div>
  )
}
