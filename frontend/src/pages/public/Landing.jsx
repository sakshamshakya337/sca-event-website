import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Shield, Calendar, CheckSquare, LogIn, Globe, HelpCircle, Menu } from 'lucide-react'
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

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[520px] md:min-h-[640px] pt-[60px] bg-[#1e3a5f] flex items-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(rgba(147, 197, 253, 0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
          <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#93C5FD] font-[JetBrains Mono] text-xs tracking-widest uppercase py-1 px-3 border border-[#93C5FD]/30 rounded-full inline-block">
                SCA EVENT MANAGEMENT SYSTEM
              </span>
              <h1 className="text-[40px] md:text-[56px] leading-tight text-white font-extrabold max-w-xl">
                Manage Events. <br />
                <span className="text-[#dbe1ff]">Empower Students.</span>
              </h1>
              <p className="text-[#CBD5E1] text-lg max-w-lg leading-relaxed">
                A unified platform for the School of Computer Application at LPU — manage events, assign tasks, track progress across all roles.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/portal" className="bg-[#0051d5] text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-[#0051d5]/20 transition-all active:scale-95">
                  Enter Portal
                  <ArrowRight size={24} />
                </Link>
                <Link to="/about" className="border border-white/30 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  Learn More
                  <ChevronDown size={16} />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-10 bg-[#0051d5]/10 blur-[100px] rounded-full"></div>
              <div className="relative p-4 rounded-2xl border border-white/20" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(8px)'
              }}>
                <div className="bg-[#f6fafe] rounded-xl overflow-hidden shadow-2xl">
                  <img className="w-full h-[380px] object-cover" alt="A clean, professional software dashboard interface" src="/landing.png" />
                  <div className="p-6 flex items-center justify-between border-t border-[#c4c6cf] bg-[#f0f4f8]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#316bf3]/20 flex items-center justify-center text-[#0051d5]">
                        <CheckSquare size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-[#022448]">Live Planning</p>
                        <p className="text-xs text-[#43474e]">Real-time engagement metrics</p>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#f6fafe] bg-[#022448] text-[10px] flex items-center justify-center text-white">S</div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#f6fafe] bg-[#0051d5] text-[10px] flex items-center justify-center text-white">F</div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#f6fafe] bg-[#0a0085] text-[10px] flex items-center justify-center text-white">A</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[#022448] py-8 border-y border-white/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-[#dbe1ff] text-lg font-semibold">4 User Roles</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Access Levels</div>
              </div>
              <div className="space-y-1">
                <div className="text-[#dbe1ff] text-lg font-semibold">Real-Time</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Live Database</div>
              </div>
              <div className="space-y-1">
                <div className="text-[#dbe1ff] text-lg font-semibold">JWT Auth</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Secure Access</div>
              </div>
              <div className="space-y-1">
                <div className="text-[#dbe1ff] text-lg font-semibold">LPU Exclusive</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Institutional</div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Approved Events */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[32px] text-[#022448] font-bold">Upcoming Approved Events</h2>
                <p className="text-[#43474e] max-w-2xl">Only SCA approved events appear here with registration details and event imagery.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#8b96a4]">{approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}</div>
                <Link to="/events" className="text-sm text-[#0051d5] font-medium hover:underline">View All Events →</Link>
              </div>
            </div>

            {isEventsLoading ? (
              <div className="rounded-3xl border border-dashed border-[#c4c6cf] p-12 text-center text-[#64748b]">Loading events…</div>
            ) : eventsError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-red-700">{eventsError}</div>
            ) : approvedEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#c4c6cf] p-12 text-center text-[#64748b]">No upcoming events are approved yet.</div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-3">
                  {approvedEvents.map((event) => (
                    <article key={event._id} className="overflow-hidden rounded-3xl border border-[#e2e8f0] shadow-sm hover:shadow-lg transition-shadow bg-white">
                      <div className="overflow-hidden bg-[#f8fafc]">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-auto" />
                        ) : (
                          <div className="flex items-center justify-center text-center text-[#64748b] px-4 py-12">
                            <div>
                              <p className="font-semibold">No image uploaded</p>
                              <p className="text-sm mt-2">This event was approved without a banner image.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex rounded-full bg-[#e0f2fe] px-3 py-1 text-sm font-semibold text-[#0369a1]">{event.type || 'Event'}</span>
                          <span className="text-sm text-[#64748b]">{formatDate(event.date)}</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-[#022448]">{event.title}</h3>
                          <p className="text-[#4b5563] line-clamp-3">{event.description || 'No description provided.'}</p>
                        </div>
                      <div className="space-y-3">
                        <p className="text-sm text-[#64748b]"><span className="font-semibold text-[#111827]">Venue:</span> {event.venue}</p>
                        {event.registerLink && !event.registrationNotRequired && (
                          <a
                            href={event.registerLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-[#0051d5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#003ea8] transition-colors"
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
        <section className="py-24 bg-[#f6fafe]" id="about">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-[32px] text-[#022448] font-bold">Everything you need to run SCA events</h2>
              <p className="text-[#43474e]">A comprehensive toolset designed for the specific workflow of University event coordination, from approval to execution.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-[#f0f4f8] p-8 rounded-xl border border-[#c4c6cf] hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-[#316bf3]/10 rounded-xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#316bf3] group-hover:text-white transition-colors">
                  <Shield size={36} />
                </div>
                <h3 className="text-lg font-semibold text-[#022448] mb-3">Role-Based Access</h3>
                <p className="text-[#43474e] leading-relaxed">Granular permissions for Admins, Faculty, Organizers, and Students. Everyone sees exactly what they need.</p>
              </div>
              {/* Card 2 */}
              <div className="bg-[#f0f4f8] p-8 rounded-xl border border-[#c4c6cf] hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-[#316bf3]/10 rounded-xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#316bf3] group-hover:text-white transition-colors">
                  <Calendar size={36} />
                </div>
                <h3 className="text-lg font-semibold text-[#022448] mb-3">CalendarDays Lifecycle</h3>
                <p className="text-[#43474e] leading-relaxed">From initial proposal through approval queue to post-event reporting, manage the entire lifecycle in one place.</p>
              </div>
              {/* Card 3 */}
              <div className="bg-[#f0f4f8] p-8 rounded-xl border border-[#c4c6cf] hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-[#316bf3]/10 rounded-xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#316bf3] group-hover:text-white transition-colors">
                  <CheckSquare size={36} />
                </div>
                <h3 className="text-lg font-semibold text-[#022448] mb-3">ClipboardList & Todo Tracking</h3>
                <p className="text-[#43474e] leading-relaxed">Assign specific tasks to student teams with deadlines and automatic reminders for seamless coordination.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-[32px] text-[#022448] font-bold mb-12">Streamlined workflow for <span className="text-[#0051d5]">Academic Excellence</span></h2>
                <div className="space-y-10">
                  {/* Step 1 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#022448] text-white flex items-center justify-center font-bold">1</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-[#022448]">Admin Creates Accounts</h4>
                      <p className="text-[#43474e]">Centralized system administrators provision secure faculty and student organizer accounts via JWT authentication.</p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-bold">2</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-[#022448]">Faculty Orchestrate Events</h4>
                      <p className="text-[#43474e]">Faculty members initiate event registries, define scope, and assign dynamic todo lists to student leadership teams.</p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#316bf3] text-[#022448] flex items-center justify-center font-bold">3</div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-[#022448]">Students Execute & Track</h4>
                      <p className="text-[#43474e]">Assigned students track their progress, check off completed tasks, and provide real-time updates through their dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#0051d5]/5 rounded-[40px] -rotate-3"></div>
                <div className="relative z-10 aspect-square rounded-[40px] overflow-hidden bg-cover bg-center shadow-xl border-8 border-white" style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2TVxD18ns2BQsXhcTj1GS6bR4oqmlGnyxLI7pgptCg4kATxv2qBujBFq0tULC1CKMt-qAScaSJOQfc_9kmK8iug2DF2CFdL_5clSTpdpAQiaJ-IOZedbhBRub03neO5Ha1zO6uov7CTeN2x6aUaQN_T-GrsMsWeiNx9OFGWEj43Wp2L0nPGTGoLU4wnfMCcEc9bhKdvQErDfQIrhVRkxMFQuoBXSqIfeu8JSSSpI5mBlGGOm3j6lINCEJBoBdGEOR8Qk68k_BP5w')"
                }}></div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-[#c4c6cf] max-w-[200px] z-20">
                  <p className="font-[JetBrains Mono] text-[#0051d5] font-bold">98% Efficient</p>
                  <p className="text-xs text-[#43474e]">Reduced paperwork and coordination delays.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-[#dfe3e7]">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-[36px] text-[#022448] font-bold">Ready to elevate your department's events?</h2>
              <p className="text-[#43474e] text-lg">Join the School of Computer Application' official management portal today and streamline your institutional workflow.</p>
              <div className="flex justify-center">
                <Link to="/portal" className="bg-[#022448] text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl hover:bg-[#0051d5] transition-all active:scale-95 flex items-center gap-3">
                  Access Student Portal
                  <LogIn size={24} />
                </Link>
              </div>
            </div>
          </div>
        </section>
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
              <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Saksham shakya</a> </p>
            </div>        
          </div>
        </div>
      </footer>
    </div>
  )
}