import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, Calendar as CalendarIcon, CheckSquare, Plus, Edit2, Settings,
  ChevronRight, ChevronDown, History } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Calendar from '../../components/Calendar'
import useEventStore from '../../store/eventStore'
import useAuthStore from '../../store/authStore'
import { getEventStatusLabel, getEventCreatorName, normalizeEventStatus, isEventVisibleToFaculty } from '../../utils/eventUtils'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-on-surface-variant truncate">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
        <Icon className={iconColor} size={22} />
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = normalizeEventStatus(status)
  const map = {
    approved:  'bg-green-100  text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    rejected:  'bg-red-100    text-red-700',
    completed: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {getEventStatusLabel(status)}
    </span>
  )
}

export default function FacultyDashboard() {
  const navigate = useNavigate()
  const [expandedRow, setExpandedRow] = useState(null)
  const [viewMode, setViewMode] = useState('calendar')
  const { events, fetchEvents, setSelectedEvent, selectedEvent } = useEventStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const myEvents = events.filter(e => isEventVisibleToFaculty(e, user))
  const pending   = myEvents.filter(e => normalizeEventStatus(e.status) === 'pending').length
  const approved  = myEvents.filter(e => normalizeEventStatus(e.status) === 'approved').length
  const completed = myEvents.filter(e => normalizeEventStatus(e.status) === 'completed').length

  return (
    <PageWrapper>
      <div className="space-y-5 sm:space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary leading-tight">Dashboard Overview</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Manage and monitor your upcoming and past university events.
            </p>
          </div>
          <button
            onClick={() => navigate('/faculty/events/create')}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-btn shadow-md hover:opacity-90 transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="My Events"       value={myEvents.length} icon={CalendarIcon} iconBg="bg-blue-100"   iconColor="text-blue-700"   valueColor="text-primary" />
          <StatCard label="Pending Approval" value={pending}         icon={CheckSquare}  iconBg="bg-yellow-100" iconColor="text-yellow-700" valueColor="text-yellow-700" />
          <StatCard label="Approved"         value={approved}        icon={CheckSquare}  iconBg="bg-green-100"  iconColor="text-green-700"  valueColor="text-green-700" />
          <StatCard label="Completed"        value={completed}       icon={History}      iconBg="bg-purple-100" iconColor="text-purple-700" valueColor="text-purple-700" />
        </div>

        {/* ── Calendar section ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-primary">
              <CalendarIcon size={18} className="text-secondary shrink-0" />
              Event Calendar
            </h3>
            <div className="flex items-center bg-surface-container rounded-lg p-1 self-start xs:self-auto">
              {['calendar', 'list'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <Calendar events={myEvents} onEventClick={e => setSelectedEvent(e)} />
          ) : (
            /* List view — horizontally scrollable on small screens */
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      {['Event', 'Date', 'Venue', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {myEvents.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">No events yet.</td></tr>
                    ) : myEvents.map(event => (
                      <tr key={event._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-4 py-3 font-medium text-primary text-sm">{event.title}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{event.date}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{event.venue}</td>
                        <td className="px-4 py-3"><StatusBadge status={event.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Events table ─────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3">All My Events</h3>
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Event Title', 'Type', 'Date', 'Venue', 'Status', ''].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 sm:px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {myEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : myEvents.map(event => (
                    <React.Fragment key={event._id || event.id}>
                      <tr
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === (event._id || event.id) ? null : (event._id || event.id))}
                      >
                        <td className="px-4 sm:px-5 py-3.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {expandedRow === (event._id || event.id)
                              ? <ChevronDown size={16} className="text-secondary shrink-0" />
                              : <ChevronRight size={16} className="text-on-surface-variant shrink-0" />
                            }
                            <span className="text-sm font-semibold text-primary truncate">{event.title}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-sm text-on-surface-variant whitespace-nowrap">{event.category}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-sm text-on-surface-variant whitespace-nowrap">{event.date}</td>
                        <td className="px-4 sm:px-5 py-3.5 text-sm text-on-surface-variant">{event.venue}</td>
                        <td className="px-4 sm:px-5 py-3.5"><StatusBadge status={event.status} /></td>
                        <td className="px-4 sm:px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/faculty/events/${event._id || event.id}/edit`) }}
                              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
                              title="Settings"
                            >
                              <Settings size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRow === (event._id || event.id) && (
                        <tr className="bg-surface-container-low">
                          <td colSpan={6} className="px-5 py-4 border-l-4 border-secondary">
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Description</p>
                            <p className="text-sm text-on-surface leading-relaxed">
                              {event.description || 'No description provided.'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

      {/* ── Event details modal ───────────────────────────────────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-outline-variant">
              <h3 className="text-base sm:text-lg font-bold text-primary leading-snug pr-2">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-on-surface-variant hover:text-primary shrink-0 mt-0.5"
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-3">
              {[
                { label: 'Organizer', value: getEventCreatorName(selectedEvent.createdBy) },
                { label: 'Date',      value: selectedEvent.date },
                { label: 'Time',      value: selectedEvent.time },
                { label: 'Venue',     value: selectedEvent.venue },
                { label: 'Category',  value: selectedEvent.category },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-on-surface-variant w-20 shrink-0">{label}:</span>
                  <span className="text-on-surface">{value || '—'}</span>
                </div>
              ))}
              {selectedEvent.description && (
                <div className="text-sm">
                  <span className="font-semibold text-on-surface-variant">Description:</span>
                  <p className="mt-1 text-on-surface leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
              <div className="pt-1">
                <StatusBadge status={selectedEvent.status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
