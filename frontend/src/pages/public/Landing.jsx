import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ShieldCheck, Calendar, CheckSquare, LogIn, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'
import PublicLayout from '../../components/layout/PublicLayout'

// ── Carousel images — replace these paths with your 6 actual images in /public ──
const CAROUSEL_SLIDES = [
  {
    src: '/landing.png',
    label: 'Event Dashboard',
    sub: 'Real-time planning & progress tracking',
  },
  {
    src: '/sca event website/academic elite/screen.png',
    label: 'Academic Events',
    sub: 'Workshops, seminars & cultural programs',
  },
  {
    src: '/sca event website/academic elite/landing.jpeg',
    label: 'Campus Activities',
    sub: 'Connecting students across departments',
  },
  {
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    label: 'Event Management',
    sub: 'Faculty-led event coordination',
  },
  {
    src: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
    label: 'Student Collaboration',
    sub: 'Task assignment & team management',
  },
  {
    src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    label: 'Live Approvals',
    sub: 'Seamless admin approval workflow',
  },
]

// ── Auto-play carousel component ─────────────────────────────────────────────
function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const total = CAROUSEL_SLIDES.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  // Auto-advance every 4 seconds, pause on hover
  useEffect(() => {
    if (isHovered) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [next, isHovered])

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-card border border-outline-variant group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative h-[360px] md:h-[400px] bg-surface-container-high">
        {CAROUSEL_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.label}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = '/landing.png' }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {/* Slide caption */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
              <p className="text-white font-bold text-base leading-tight">{slide.label}</p>
              <p className="text-white/70 text-xs mt-0.5">{slide.sub}</p>
            </div>
          </div>
        ))}

        {/* Prev / Next buttons */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full transition-all duration-300 ${
              idx === current
                ? 'w-5 h-2 bg-primary shadow-sm'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-30">
        <div
          key={current}
          className="h-full bg-primary origin-left"
          style={{
            animation: isHovered ? 'none' : 'progressBar 4s linear forwards',
          }}
        />
      </div>

      {/* Bottom info bar */}
      <div className="bg-surface-container-low border-t border-outline-variant px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <CheckSquare size={16} />
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">Live Planning</p>
            <p className="text-xs text-on-surface-variant">Real-time engagement metrics</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-secondary text-[9px] flex items-center justify-center text-on-secondary font-bold">S</div>
          <div className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-primary text-[9px] flex items-center justify-center text-on-primary font-bold">F</div>
          <div className="w-7 h-7 rounded-full border-2 border-surface-container-low bg-tertiary text-[9px] flex items-center justify-center text-on-tertiary font-bold">A</div>
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}

export default function Landing() {
  const [approvedEvents, setApprovedEvents] = useState([])
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      setIsEventsLoading(true)
      setEventsError(null)
      try {
        const res = await api.get('/events/approved-events')
        setApprovedEvents(res.data.data)
      } catch (err) {
        setEventsError(err.response?.data?.message || 'Unable to load upcoming events')
      } finally {
        setIsEventsLoading(false)
      }
    }
    fetchApprovedEvents()
  }, [])

  return (
    <PublicLayout>
        {/* Hero Section */}
        <section className="relative min-h-[520px] md:min-h-[640px] pt-[60px] bg-secondary-container flex items-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(rgba(255, 182, 139, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
          <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-primary font-mono text-xs tracking-widest uppercase py-1 px-3 border border-primary/30 rounded-full inline-block">
                SCA EVENT MANAGEMENT SYSTEM
              </span>
              <h1 className="text-[40px] md:text-[56px] leading-tight text-on-primary-container font-extrabold max-w-xl">
                Manage Events. <br />
                <span className="text-on-secondary-container">Empower Students.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">
                A unified platform for the School of Computer Application at LPU — manage events, assign tasks, track progress across all roles.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/portal" className="bg-primary text-on-primary px-8 py-4 rounded-btn font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95">
                  Enter Portal
                  <ArrowRight size={24} />
                </Link>
                <Link to="/about" className="border-2 border-primary text-primary px-8 py-4 rounded-btn font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 active:scale-95">
                  Learn More
                  <ChevronDown size={16} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              <HeroCarousel />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-secondary py-8 border-y border-outline-variant">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-secondary-fixed text-lg font-semibold">4 User Roles</div>
                <div className="text-on-secondary/60 text-xs uppercase tracking-wider">Access Levels</div>
              </div>
              <div className="space-y-1">
                <div className="text-secondary-fixed text-lg font-semibold">Real-Time</div>
                <div className="text-on-secondary/60 text-xs uppercase tracking-wider">Live Database</div>
              </div>
              <div className="space-y-1">
                <div className="text-secondary-fixed text-lg font-semibold">JWT Auth</div>
                <div className="text-on-secondary/60 text-xs uppercase tracking-wider">Secure Access</div>
              </div>
              <div className="space-y-1">
                <div className="text-secondary-fixed text-lg font-semibold">LPU Exclusive</div>
                <div className="text-on-secondary/60 text-xs uppercase tracking-wider">Institutional</div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Approved Events */}
        <section className="py-24 bg-surface-card">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[32px] text-on-surface font-bold">Upcoming Approved Events</h2>
                <p className="text-on-surface-variant max-w-2xl">Only SCA approved events appear here with registration details and event imagery.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-on-surface-variant">{approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}</div>
                <Link to="/events" className="text-sm text-primary font-medium hover:underline">View All Events →</Link>
              </div>
            </div>

            {isEventsLoading ? (
              <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">Loading events…</div>
            ) : eventsError ? (
              <div className="rounded-card border border-error-container bg-error-container p-12 text-center text-on-error-container">{eventsError}</div>
            ) : approvedEvents.length === 0 ? (
              <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">No upcoming events are approved yet.</div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-3">
                  {approvedEvents.map((event) => (
                    <article key={event._id} className="overflow-hidden rounded-card border border-outline-variant shadow-sm hover:shadow-card transition-shadow bg-surface-card">
                      <div className="overflow-hidden bg-surface-container-low">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-auto" />
                        ) : (
                          <div className="flex items-center justify-center text-center text-on-surface-variant px-4 py-12">
                            <div>
                              <p className="font-semibold">No image uploaded</p>
                              <p className="text-sm mt-2">This event was approved without a banner image.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex rounded-full bg-primary-fixed text-on-primary-fixed px-3 py-1 text-sm font-semibold">{event.type || 'Event'}</span>
                          <span className="text-sm text-on-surface-variant">{formatDate(event.date)}</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-on-surface">{event.title}</h3>
                          <p className="text-on-surface-variant line-clamp-3">{event.description || 'No description provided.'}</p>
                        </div>
                      <div className="space-y-3">
                        <p className="text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">Venue:</span> {event.venue}</p>
                        {event.registerLink && !event.registrationNotRequired && (
                          <a
                            href={event.registerLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition-colors"
                          >
                            Register Now
                          </a>
                        )}
                      </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background" id="about">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-[32px] text-on-surface font-bold">Everything you need to run SCA events</h2>
              <p className="text-on-surface-variant">A comprehensive toolset designed for the specific workflow of University event coordination, from approval to execution.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-surface-container p-8 rounded-card border border-outline-variant hover:shadow-card transition-shadow group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-card flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-3">Role-Based Access</h3>
                <p className="text-on-surface-variant leading-relaxed">Granular permissions for Admins, Faculty, Organizers, and Students. Everyone sees exactly what they need.</p>
              </div>
              {/* Card 2 */}
              <div className="bg-surface-container p-8 rounded-card border border-outline-variant hover:shadow-card transition-shadow group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-card flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Calendar size={36} />
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-3">Event Lifecycle</h3>
                <p className="text-on-surface-variant leading-relaxed">From initial proposal through approval queue to post-event reporting, manage the entire lifecycle in one place.</p>
              </div>
              {/* Card 3 */}
              <div className="bg-surface-container p-8 rounded-card border border-outline-variant hover:shadow-card transition-shadow group">
                <div className="w-14 h-14 bg-primary-container/10 rounded-card flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <CheckSquare size={36} />
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-3">Tasks & Todo Tracking</h3>
                <p className="text-on-surface-variant leading-relaxed">Assign specific tasks to student teams with deadlines and automatic reminders for seamless coordination.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-surface-card relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-[32px] text-on-surface font-bold mb-12">Streamlined workflow for <span className="text-primary">Academic Excellence</span></h2>
                <div className="space-y-10">
                  {/* Step 1 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">1</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-on-surface">Admin Creates Accounts</h4>
                      <p className="text-on-surface-variant">Centralized system administrators provision secure faculty and student organizer accounts via JWT authentication.</p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">2</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-on-surface">Faculty Orchestrate Events</h4>
                      <p className="text-on-surface-variant">Faculty members initiate event registries, define scope, and assign dynamic todo lists to student leadership teams.</p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold">3</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-on-surface">Students Execute & Track</h4>
                      <p className="text-on-surface-variant">Assigned students track their progress, check off completed tasks, and provide real-time updates through their dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-[40px] -rotate-3"></div>
                <div className="relative z-10 aspect-square rounded-[40px] overflow-hidden bg-cover bg-center shadow-card border-8 border-surface-card" style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2TVxD18ns2BQsXhcTj1GS6bR4oqmlGnyxLI7pgptCg4kATxv2qBujBFq0tULC1CKMt-qAScaSJOQfc_9kmK8iug2DF2CFdL_5clSTpdpAQiaJ-IOZedbhBRub03neO5Ha1zO6uov7CTeN2x6aUaQN_T-GrsMsWeiNx9OFGWEj43Wp2L0nPGTGoLU4wnfMCcEc9bhKdvQErDfQIrhVRkxMFQuoBXSqIfeu8JSSSpI5mBlGGOm3j6lINCEJBoBdGEOR8Qk68k_BP5w')"
                }}></div>
                <div className="absolute -bottom-6 -left-6 bg-surface-card p-6 rounded-2xl shadow-card border border-outline-variant max-w-[200px] z-20">
                  <p className="font-mono text-primary font-bold">98% Efficient</p>
                  <p className="text-xs text-on-surface-variant">Reduced paperwork and coordination delays.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-surface-container">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-[36px] text-on-surface font-bold">Ready to elevate your department's events?</h2>
              <p className="text-on-surface-variant text-lg">Join the School of Computer Application' official management portal today and streamline your institutional workflow.</p>
              <div className="flex justify-center">
                <Link to="/portal" className="bg-primary text-on-primary px-10 py-5 rounded-btn font-bold text-lg shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-3">
                  Access Student Portal
                  <LogIn size={24} />
                </Link>
              </div>
            </div>
          </div>
        </section>
    </PublicLayout>
  )
}
