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

      <main className="pt-[60px]">
        {/* Events Header */}
        <section className="py-16 bg-secondary-container">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl">
              <span className="text-primary font-mono text-xs tracking-widest uppercase py-1 px-3 border border-primary/30 rounded-full inline-block mb-4">
                SCA EVENTS
              </span>
              <h1 className="text-[40px] md:text-[48px] text-on-surface font-extrabold leading-tight">
                Upcoming Events
              </h1>
              <p className="text-on-surface-variant text-lg mt-4 max-w-xl">
                Browse all approved upcoming events organized by the School of Computer Application. Register and participate in academic events, technical workshops, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16 bg-surface-card">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[32px] text-on-surface font-bold">All Approved Events</h2>
                <p className="text-on-surface-variant max-w-2xl">Only SCA approved events appear here with registration details and event imagery.</p>
              </div>
              <div className="text-sm text-on-surface-variant">{approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}</div>
            </div>

            {isEventsLoading ? (
              <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">Loading events…</div>
            ) : eventsError ? (
              <div className="rounded-card border border-error-container bg-error-container p-12 text-center text-on-error-container">{eventsError}</div>
            ) : approvedEvents.length === 0 ? (
              <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">No upcoming events are approved yet.</div>
            ) : (
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
            )}
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
                <li><Link className="hover:text-on-secondary transition-colors" to="/events">Events</Link></li>
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
              <p>Developed and maintained by - <a href="https://www.sakshamshakya.tech/" target="_blank" rel="noreferrer" className="hover:text-on-secondary transition-colors">Saksham shakya</a></p>
            </div>           
          </div>
        </div>
      </footer>
    </div>
  )
}
