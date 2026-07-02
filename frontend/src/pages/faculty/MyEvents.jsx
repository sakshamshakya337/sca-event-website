import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { Star, MapPin, CalendarDays, Plus, ImageOff, Eye } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import { getEventStatusLabel, normalizeEventStatus } from '../../utils/eventUtils'

const categoryColors = {
  Workshop: 'bg-blue-100 text-blue-800',
  Seminar: 'bg-purple-100 text-purple-800',
  Cultural: 'bg-pink-100 text-pink-800',
  Sports: 'bg-orange-100 text-orange-800',
  Technical: 'bg-cyan-100 text-cyan-800',
  Other: 'bg-gray-100 text-gray-800',
}

const statusConfig = {
  approved:  { cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  rejected:  { cls: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500' },
  completed: { cls: 'bg-gray-50 text-gray-600 border-gray-200',      dot: 'bg-gray-400' },
}

export default function MyEvents() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = events.filter(event => {
    const status = normalizeEventStatus(event.status)
    if (activeFilter === 'All') return true
    return status === activeFilter.toLowerCase()
  })

  const counts = {
    All: events.length,
    Approved: events.filter(e => normalizeEventStatus(e.status) === 'approved').length,
    Pending: events.filter(e => normalizeEventStatus(e.status) === 'pending').length,
    Completed: events.filter(e => normalizeEventStatus(e.status) === 'completed').length,
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-on-surface">My Events</h2>
            <p className="text-body-md text-on-surface-variant">Academic Cycle 2025-26</p>
          </div>
          <button
            onClick={() => navigate('/faculty/events/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-btn hover:opacity-90 transition-all active:scale-95 shadow-md"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-surface-container p-1 rounded-xl w-full sm:w-fit">
          {['All', 'Approved', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeFilter === f
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-xl p-16 text-center">
            <CalendarDays size={48} className="mx-auto text-on-surface-variant opacity-30 mb-4" />
            <p className="text-on-surface-variant text-body-md">No events found.</p>
            <button
              onClick={() => navigate('/faculty/events/create')}
              className="mt-4 px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-btn hover:opacity-90"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map(event => {
              const status = normalizeEventStatus(event.status)
              const cfg = statusConfig[status] || statusConfig.pending
              const catCls = categoryColors[event.type || event.category] || categoryColors.Other

              return (
                <div
                  key={event._id}
                  className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => navigate(`/faculty/events/${event.slug || event._id}`)}
                >
                  {/* Banner */}
                  <div className="relative h-44 bg-surface-container-high overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-container to-surface-container-high">
                        <ImageOff size={32} className="text-outline-variant" />
                        <span className="text-xs text-on-surface-variant">No image</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-sm ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {getEventStatusLabel(event.status)}
                      </span>
                    </div>

                    {/* Important star */}
                    {event.isImportant && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                        <Star size={12} fill="currentColor" />
                      </div>
                    )}

                    {/* Category */}
                    {(event.type || event.category) && (
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${catCls}`}>
                          {event.type || event.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} className="shrink-0 text-outline" />
                        <span>
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="shrink-0 text-outline" />
                        <span className="truncate">{event.venue || '—'}</span>
                      </div>
                    </div>

                    {/* View button */}
                    <div
                      className="mt-4 border-t border-outline-variant/50 pt-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/faculty/events/${event.slug || event._id}`)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-secondary hover:bg-secondary/10 transition-colors border border-secondary/30"
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
