import { useState, useEffect } from 'react'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'
import PublicLayout from '../../components/layout/PublicLayout'

export default function Events() {
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
      {/* Header */}
      <section className="py-12 sm:py-16 bg-secondary-container">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-primary font-mono text-xs tracking-widest uppercase py-1 px-3 border border-primary/30 rounded-full inline-block mb-4">
              SCA EVENTS
            </span>
            <h1 className="text-3xl sm:text-[40px] md:text-[48px] text-on-surface font-extrabold leading-tight">
              Upcoming Events
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg mt-3 max-w-xl">
              Browse all approved upcoming events organized by the School of Computer Application.
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 sm:py-16 bg-surface-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold">All Approved Events</h2>
              <p className="text-on-surface-variant text-sm sm:text-base mt-1">
                Only SCA approved events appear here with registration details and event imagery.
              </p>
            </div>
            <div className="text-sm text-on-surface-variant shrink-0">
              {approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}
            </div>
          </div>

          {isEventsLoading ? (
            <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">
              Loading events…
            </div>
          ) : eventsError ? (
            <div className="rounded-card border border-error-container bg-error-container p-12 text-center text-on-error-container">
              {eventsError}
            </div>
          ) : approvedEvents.length === 0 ? (
            <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">
              No upcoming events are approved yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {approvedEvents.map((event) => (
                <article
                  key={event._id}
                  className="overflow-hidden rounded-card border border-outline-variant shadow-sm hover:shadow-card transition-shadow bg-surface-card"
                >
                  <div className="overflow-hidden bg-surface-container-low">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-auto" />
                    ) : (
                      <div className="flex items-center justify-center text-center text-on-surface-variant px-4 py-10">
                        <div>
                          <p className="font-semibold text-sm">No image uploaded</p>
                          <p className="text-xs mt-1">This event was approved without a banner image.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="inline-flex rounded-full bg-primary-fixed text-on-primary-fixed px-3 py-1 text-xs font-semibold">
                        {event.type || 'Event'}
                      </span>
                      <span className="text-xs text-on-surface-variant">{formatDate(event.date)}</span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-on-surface">{event.title}</h3>
                      <p className="text-on-surface-variant line-clamp-3 text-sm">
                        {event.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-on-surface-variant">
                        <span className="font-semibold text-on-surface">Venue:</span> {event.venue}
                      </p>
                      {event.registerLink && !event.registrationNotRequired && (
                        <a
                          href={event.registerLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-all shadow-md"
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
    </PublicLayout>
  )
}
