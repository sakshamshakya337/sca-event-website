import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'
import PublicLayout from '../../components/layout/PublicLayout'
import { MapPin, Calendar, ArrowRight, Image, CheckCircle2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// EVENT SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
function EventSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-outline-variant shadow-sm bg-surface-card">
      {/* Image skeleton */}
      <div className="relative overflow-hidden bg-surface-container-low aspect-video animate-pulse" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-surface-container-low rounded animate-pulse" />
          <div className="h-5 bg-surface-container-low rounded w-3/4 animate-pulse" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-1.5 pt-2">
          <div className="h-4 bg-surface-container-low rounded animate-pulse" />
          <div className="h-4 bg-surface-container-low rounded w-5/6 animate-pulse" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="h-3 bg-surface-container-low rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-surface-container-low rounded w-2/3 animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="mt-2 w-full h-10 bg-surface-container-low rounded-lg animate-pulse" />
      </div>
    </article>
  )
}

// Status badge styles
const getStatusBadgeClass = (status) => {
  const normalized = status?.toLowerCase()
  if (normalized === 'completed') {
    return 'bg-purple-100 text-purple-700'
  }
  return 'bg-green-100 text-green-700'
}

const getStatusLabel = (status) => {
  const normalized = status?.toLowerCase()
  if (normalized === 'completed') {
    return 'Completed'
  }
  return 'Upcoming'
}

export default function Events() {
  const [allEvents, setAllEvents] = useState([])
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)

  useEffect(() => {
    const fetchAllPublicEvents = async () => {
      setIsEventsLoading(true)
      setEventsError(null)
      try {
        const res = await api.get('/events/all-public')
        setAllEvents(res.data.data)
      } catch (err) {
        setEventsError(err.response?.data?.message || 'Unable to load events')
      } finally {
        setIsEventsLoading(false)
      }
    }
    fetchAllPublicEvents()
  }, [])

  return (
    <PublicLayout>
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-secondary-container">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-primary font-mono text-xs tracking-widest uppercase py-1 px-3 border border-primary/30 rounded-full inline-block mb-4">
              SCA EVENTS
            </span>
            <h1 className="text-3xl sm:text-[40px] md:text-[48px] text-on-surface font-extrabold leading-tight">
              All SCA Events
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg mt-3 max-w-xl">
              Browse all SCA events, including upcoming and past completed events.
            </p>
          </div>
        </div>
      </section>

      {/* ── Events grid ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-surface-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl sm:text-[28px] text-on-surface font-bold">All Events</h2>
              <p className="text-on-surface-variant text-sm sm:text-base mt-1">
                Browse all SCA-approved events, past and present.
              </p>
            </div>
            <span className="text-sm text-on-surface-variant shrink-0">
              {allEvents.length} event{allEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isEventsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <EventSkeleton key={idx} />
              ))}
            </div>
          ) : eventsError ? (
            <div className="rounded-card border border-error-container bg-error-container p-12 text-center text-on-error-container">
              {eventsError}
            </div>
          ) : allEvents.length === 0 ? (
            <div className="rounded-card border border-dashed border-outline-variant p-12 text-center text-on-surface-variant">
              No SCA events yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allEvents.map(event => (
                <article
                  key={event._id}
                  className={`group flex flex-col overflow-hidden rounded-card border border-outline-variant shadow-sm hover:shadow-card transition-all duration-200 bg-surface-card ${event.status?.toLowerCase() === 'completed' ? 'opacity-90' : ''}`}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-surface-container-low aspect-video">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
                        <Image size={32} />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                    {/* Type badge */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {event.type}
                    </span>
                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm backdrop-blur-sm ${getStatusBadgeClass(event.status)}`}>
                      {event.status?.toLowerCase() === 'completed' && <CheckCircle2 size={10} />}
                      {getStatusLabel(event.status)}
                    </span>
                    {/* Gallery count badge */}
                    {event.gallery?.length > 0 && (
                      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        +{event.gallery.length} photos
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-on-surface-variant text-sm line-clamp-2 flex-1">
                      {event.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Calendar size={12} className="shrink-0 text-primary" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <MapPin size={12} className="shrink-0 text-primary" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      to={`/events/${event.slug || event._id}`}
                      className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
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
