import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import { HelpCircle, Search, ChevronDown, MessageSquare, FileQuestion, ArrowRight } from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'General',
    question: 'What is the SCA Event Management Platform?',
    answer: 'The SCA Event Platform is the official digital portal for the School of Computer Applications at Lovely Professional University. It enables students, faculty, and administrators to register for events, submit projects, manage approvals, publish galleries, and track academic achievements.'
  },
  {
    category: 'General',
    question: 'Who can register for events on this portal?',
    answer: 'Any active student or faculty member of the School of Computer Applications (LPU) with valid university credentials can register for events. External guest participants can also register when open public events are hosted.'
  },
  {
    category: 'Events & Registration',
    question: 'How do I register for an event?',
    answer: 'Browse active events on the Events page, select your desired event, click "Register Now", and follow the prompt. If you are not logged in, you will be prompted to sign in with your student or faculty account.'
  },
  {
    category: 'Events & Registration',
    question: 'Can I cancel or modify my event registration?',
    answer: 'Yes! You can view and manage all your registered events under your Student or Faculty Dashboard in the "My Events" section up until the registration deadline.'
  },
  {
    category: 'Events & Registration',
    question: 'How do event approvals work for Faculty and HODs?',
    answer: 'Events submitted by faculty coordinators undergo a multi-level approval pipeline involving the Head of Department (HOD), Head of School (HOS), and Dean before being published publicly.'
  },
  {
    category: 'Account & Portal',
    question: 'How do I activate or log into my account?',
    answer: 'Navigate to the Portal Gateway (/portal), choose your role (Student, Faculty, HOD, Dean, Admin), and log in using your university email and password.'
  },
  {
    category: 'Account & Portal',
    question: 'What should I do if I forget my password?',
    answer: 'Click on "Forgot Password" on the Portal login screen. Enter your registered email address to receive a secure password reset link.'
  },
  {
    category: 'Certificates & Media',
    question: 'When and where will event participation certificates be issued?',
    answer: 'Certificates are generated digitally upon event completion and attendance verification. You can view and download your certificates directly from your Student Profile dashboard.'
  },
  {
    category: 'Certificates & Media',
    question: 'Where can I view photo galleries from past events?',
    answer: 'Visit the public Gallery section to view photo albums, event highlights, video recaps, and student showcases categorized by department and academic year.'
  },
  {
    category: 'Technical Support',
    question: 'What should I do if I encounter an error while uploading documents or images?',
    answer: 'Ensure your file size is under 5MB and in supported formats (JPG, PNG, PDF, DOCX). Clear your browser cache or try re-logging into the portal. If issues persist, contact support via our Contact Page.'
  },
]

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [openIndex, setOpenIndex] = useState(0)

  const categories = ['All', 'General', 'Events & Registration', 'Account & Portal', 'Certificates & Media', 'Technical Support']

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen pb-20 font-sans text-on-surface">
        {/* Header Hero Section */}
        <section className="bg-gradient-to-b from-[#1E1B18] via-[#33302D] to-primary text-on-primary py-16 px-6 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-primary-fixed-dim text-xs font-semibold backdrop-blur border border-white/15">
              <HelpCircle size={15} /> Help Center & Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-primary-fixed-dim text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about event registrations, student & faculty portal access, approvals, and certificates.
            </p>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto pt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions e.g. registration, certificate, login..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-card text-on-surface placeholder:text-on-surface-variant/60 text-sm sm:text-base font-medium shadow-2xl border border-outline-variant focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all"
                />
                <Search className="absolute left-4 top-4.5 text-on-surface-variant" size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-20">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setOpenIndex(0)
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-card text-on-surface-variant border border-outline-variant hover:bg-surface-container'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="mt-6 space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx
                return (
                  <div
                    key={idx}
                    className="bg-surface-card rounded-2xl border border-outline-variant shadow-sm overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 hover:bg-surface-container/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary-fixed/60 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-outline-variant">
                          Q{idx + 1}
                        </span>
                        <h3 className="font-bold text-on-surface text-sm sm:text-base leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-on-surface-variant transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-outline-variant/60 text-on-surface-variant text-sm leading-relaxed bg-surface-container/40">
                        <p>{faq.answer}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary-fixed/40 border border-outline-variant px-2.5 py-0.5 rounded-full">
                            Category: {faq.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-surface-card rounded-2xl p-12 text-center border border-outline-variant">
                <FileQuestion size={40} className="text-on-surface-variant/40 mx-auto mb-3" />
                <h4 className="font-bold text-on-surface text-lg mb-1">No matching questions found</h4>
                <p className="text-on-surface-variant text-sm">
                  Try adjusting your search terms or select another category.
                </p>
              </div>
            )}
          </div>

          {/* Still Need Help Box */}
          <div className="mt-12 bg-gradient-to-r from-secondary to-primary rounded-3xl p-8 text-on-primary shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-outline-variant">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <MessageSquare className="text-primary-fixed-dim" size={22} /> Have a specific question or issue?
              </h3>
              <p className="text-primary-fixed/90 text-xs sm:text-sm max-w-lg">
                Our support team and event coordinators are available to assist you with account verification, event hosting, and technical help.
              </p>
            </div>

            <Link
              to="/contact"
              className="bg-surface-card text-primary font-bold text-sm px-6 py-3.5 rounded-2xl hover:bg-surface-container transition-all shrink-0 flex items-center gap-2 shadow-lg active:scale-95"
            >
              Contact Support <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
