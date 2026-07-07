import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { Star, MapPin } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import { normalizeEventStatus, getEventStatusLabel } from '../../utils/eventUtils'

const catColors = {
  Workshop:  'bg-blue-100 text-blue-700',
  Seminar:   'bg-purple-100 text-purple-700',
  Cultural:  'bg-pink-100 text-pink-700',
  Sports:    'bg-orange-100 text-orange-700',
  Technical: 'bg-cyan-100 text-cyan-700',
  Other:     'bg-gray-100 text-gray-600',
}

const statusCfg = {
  approved:  { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  rejected:  { cls: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500'   },
  completed: { cls: 'bg-gray-50 text-gray-600 border-gray-200',    dot: 'bg-gray-400'  },
}

function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function MyEvents() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const [filter, setFilter] = useState('All')

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const counts = {
    All: events.length,
    Approved: events.filter(e => normalizeEventStatus(e.status) === 'approved').length,
    Pending:  events.filter(e => normalizeEventStatus(e.status) === 'pending').length,
    Completed:events.filter(e => normalizeEventStatus(e.status) === 'completed').length,
  }

  const filtered = events.filter(e =>
    filter === 'All' ? true : normalizeEventStatus(e.status) === filter.toLowerCase()
  )

  return (
    <PageWrapper>
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-surface-container p-1 rounded-xl gap-0.5 flex-wrap">
          {['All', 'Approved', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {f} <span className="opacity-50">{counts[f]}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant">Academic Cycle 2025-26</p>
      </div>

      {/* Events — always card-based for simplicity and full responsiveness */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-10 text-center text-sm text-on-surface-variant">
          No events found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(event => {
            const status = normalizeEventStatus(event.status)
            const cfg = statusCfg[status] || statusCfg.pending
            const type = event.type || event.category
            return (
              <div
                key={event._id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
                onClick={() => navigate(`/student/events/${event.slug || event._id}`)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {event.isImportant && <Star size={13} className="text-amber-500 shrink-0" fill="currentColor" />}
                    <p className="font-semibold text-primary text-sm leading-snug line-clamp-2">{event.title}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {getEventStatusLabel(event.status)}
                  </span>
                </div>

                {/* Meta */}
                <div className="space-y-1 text-xs text-on-surface-variant">
                  <p>{fmt(event.startDate)}</p>
                  {event.venue && (
                    <p className="flex items-center gap-1"><MapPin size={10} /><span className="truncate">{event.venue}</span></p>
                  )}
                </div>

                {/* Type badge */}
                {type && (
                  <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catColors[type] || catColors.Other}`}>
                    {type}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
