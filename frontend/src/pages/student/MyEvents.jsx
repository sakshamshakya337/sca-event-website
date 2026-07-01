import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { Star, StarOff, MapPin, CalendarCheck, ImageOff } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import { normalizeEventStatus, getEventStatusLabel } from '../../utils/eventUtils'

const categoryColors = {
  Workshop:  'bg-blue-100 text-blue-800',
  Seminar:   'bg-purple-100 text-purple-800',
  Cultural:  'bg-pink-100 text-pink-800',
  Sports:    'bg-orange-100 text-orange-800',
  Technical: 'bg-cyan-100 text-cyan-800',
  Other:     'bg-gray-100 text-gray-700',
}

const statusConfig = {
  approved:  { cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  rejected:  { cls: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500'   },
  completed: { cls: 'bg-gray-50 text-gray-600 border-gray-200',      dot: 'bg-gray-400'  },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function MyEvents() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const counts = {
    All: events.length,
    Approved: events.filter(e => normalizeEventStatus(e.status) === 'approved').length,
    Pending: events.filter(e => normalizeEventStatus(e.status) === 'pending').length,
    Completed: events.filter(e => normalizeEventStatus(e.status) === 'completed').length,
  }

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'All') return true
    return normalizeEventStatus(event.status) === activeFilter.toLowerCase()
  })

  return (
    <PageWrapper>
      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex bg-surface-container p-1 rounded-xl w-full md:w-auto">
          {['All', 'Approved', 'Pending', 'Completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-body-md font-semibold transition-colors ${
                activeFilter === filter
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {filter}
              <span className="ml-1 opacity-60">{counts[filter]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <CalendarCheck size={16} />
          <span>Academic Cycle 2025-26</span>
        </div>
      </div>

      {/* Events list */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-outline-variant rounded-xl p-16 text-center">
          <p className="text-on-surface-variant">No events found.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date & Venue</th>
                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredEvents.map(event => {
                const status = normalizeEventStatus(event.status)
                const cfg = statusConfig[status] || statusConfig.pending
                const eventType = event.type || event.category
                const catCls = categoryColors[eventType] || categoryColors.Other

                return (
                  <tr
                    key={event._id}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => navigate(`/student/events/${event._id}`)}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.isImportant
                          ? <Star size={16} className="text-amber-500 shrink-0" fill="currentColor" />
                          : <StarOff size={16} className="text-outline-variant shrink-0" />
                        }
                        <p className="font-semibold text-primary">{event.title}</p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      {eventType ? (
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${catCls}`}>
                          {eventType}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-sm">—</span>
                      )}
                    </td>

                    {/* Date & Venue */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-on-surface">{formatDate(event.date)}</p>
                      {event.venue && (
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {event.venue}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {getEventStatusLabel(event.status)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/student/events/${event._id}`)}
                        className="text-secondary hover:underline font-semibold text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  )
}
