import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu } from 'lucide-react'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'

export default function Events() {
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

      <main className="pt-[60px]">
        {/* Events Header */}
        <section className="py-16 bg-[#1e3a5f]">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl">
              <span className="text-[#93C5FD] font-[JetBrains Mono] text-xs tracking-widest uppercase py-1 px-3 border border-[#93C5FD]/30 rounded-full inline-block mb-4">
                SCA EVENTS
              </span>
              <h1 className="text-[40px] md:text-[48px] text-white font-extrabold leading-tight">
                Upcoming Events
              </h1>
              <p className="text-[#CBD5E1] text-lg mt-4 max-w-xl">
                Browse all approved upcoming events organized by the School of Computer Application. Register and participate in academic events, technical workshops, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[32px] text-[#022448] font-bold">All Approved Events</h2>
                <p className="text-[#43474e] max-w-2xl">Only SCA approved events appear here with registration details and event imagery.</p>
              </div>
              <div className="text-sm text-[#8b96a4]">{approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}</div>
            </div>

            {isEventsLoading ? (
              <div className="rounded-3xl border border-dashed border-[#c4c6cf] p-12 text-center text-[#64748b]">Loading events…</div>
            ) : eventsError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-red-700">{eventsError}</div>
            ) : approvedEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#c4c6cf] p-12 text-center text-[#64748b]">No upcoming events are approved yet.</div>
            ) : (
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
            )}
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
                <li><Link className="hover:text-[#dbe1ff] transition-colors" to="/events">Events</Link></li>
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