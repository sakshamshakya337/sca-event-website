import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ShieldCheck, Calendar, CheckSquare, LogIn, Globe, HelpCircle, Menu } from 'lucide-react'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [approvedEvents, setApprovedEvents] = useState([])
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <div className="bg-background text-on-background font-sans">
      {/* Public TopAppBar */}
      <nav className={`fixed top-0 w-full h-[60px] z-50 backdrop-blur-md flex justify-between items-center px-6 transition-all duration-300 ${scrolled ? 'bg-background shadow-md' : 'bg-background/90'}`}>
        <Link to="/" className="flex items-center gap-3">
          <img src="/sca.png" alt="SCA Logo" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors" to="/about">About</Link>
          <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors" to="/events">Events</Link>
          <Link className="text-on-surface-variant font-medium hover:text-primary transition-colors" to="/contact">Contact</Link>
          <Link to="/portal" className="bg-primary text-on-primary px-6 py-2 rounded-btn font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md">
            Enter Portal
            <ArrowRight size={16} />
          </Link>
        </div>
        <button className="md:hidden text-on-surface">
          <Menu size={24} />
        </button>
      </nav>

      <main>
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
                <span className="text-primary-fixed">Empower Students.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">
                A unified platform for the School of Computer Application at LPU — manage events, assign tasks, track progress across all roles.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/portal" className="bg-primary text-on-primary px-8 py-4 rounded-btn font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95">
                  Enter Portal
                  <ArrowRight size={24} />
                </Link>
                <Link to="/about" className="border border-outline-variant text-on-surface px-8 py-4 rounded-btn font-bold hover:bg-surface-container transition-all flex items-center gap-2">
                  Learn More
                  <ChevronDown size={16} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full"></div>
              <div className="relative p-4 rounded-2xl border border-outline-variant" style={{
                background: 'rgba(255, 248, 243, 0.03)',
                backdropFilter: 'blur(8px)'
              }}>
                <div className="bg-surface-card rounded-card overflow-hidden shadow-card">
                  <img className="w-full h-[380px] object-cover" alt="A clean, professional software dashboard interface" src="/landing.png" />
                  <div className="p-6 flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                        <CheckSquare size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Live Planning</p>
                        <p className="text-xs text-on-surface-variant">Real-time engagement metrics</p>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-surface-card bg-secondary text-[10px] flex items-center justify-center text-on-secondary">S</div>
                      <div className="w-8 h-8 rounded-full border-2 border-surface-card bg-primary text-[10px] flex items-center justify-center text-on-primary">F</div>
                      <div className="w-8 h-8 rounded-full border-2 border-surface-card bg-tertiary text-[10px] flex items-center justify-center text-on-tertiary">A</div>
                    </div>
                  </div>
                </div>
              </div>
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
                <Link to="/portal" className="bg-secondary text-on-secondary px-10 py-5 rounded-btn font-bold text-lg shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-3">
                  Access Student Portal
                  <LogIn size={24} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-on-secondary py-16 border-t border-outline-variant">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/sca-white.png" alt="SCA Logo" className="h-10 w-auto" />
              </div>
              <p className="text-on-secondary/70 max-w-sm">
                Dedicated to enhancing the event management experience for the School of Computer Application at Lovely Professional University.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-on-secondary">Quick Links</h5>
              <ul className="space-y-4 text-on-secondary/70">
                <li><Link className="hover:text-on-secondary transition-colors" to="/about">About</Link></li>
                <li><Link className="hover:text-on-secondary transition-colors" to="/contact">Contact</Link></li>
                <li><Link className="hover:text-on-secondary transition-colors" to="/portal">Faculty Portal</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-on-secondary">Legal</h5>
              <ul className="space-y-4 text-on-secondary/70">
                <li><Link className="hover:text-on-secondary transition-colors" to="#">Terms of Use</Link></li>
                <li><Link className="hover:text-on-secondary transition-colors" to="#">Privacy Policy</Link></li>
                <li><Link className="hover:text-on-secondary transition-colors" to="#">LPU Guidelines</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 text-on-secondary/70 text-xs">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p>© 2026 SCA — School of Computer Application, LPU. All Rights Reserved.</p>
              <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-on-secondary transition-colors">Saksham shakya</a> </p>
            </div>        
          </div>
        </div>
      </footer>
    </div>
  )
}
