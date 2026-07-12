import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  XCircle, Calendar as CalendarIcon, CheckSquare, Plus,
  Edit2, Settings, ChevronRight, ChevronDown, History,
} from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Calendar from '../../components/Calendar'
import useEventStore from '../../store/eventStore'
import useAuthStore from '../../store/authStore'
import {
  getEventStatusLabel, getEventCreatorName,
  normalizeEventStatus, isEventVisibleToFaculty,
  formatDateDMY,
} from '../../utils/eventUtils'

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-3 sm:p-5 flex items-start justify-between gap-2 shadow-sm">
      <div className="min-w-0">
        <p className="text-[11px] sm:text-sm font-medium text-on-surface-variant leading-tight">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold mt-1 leading-none ${valueColor}`}>{value}</p>
      </div>
      <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${iconBg}`}>
        <Icon className={iconColor} size={18} />
      </div>
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s   = normalizeEventStatus(status)
  const cls = {
    approved : 'bg-green-100  text-green-700',
    pending  : 'bg-yellow-100 text-yellow-700',
    rejected : 'bg-red-100    text-red-700',
    completed: 'bg-purple-100 text-purple-700',
  }[s] ?? 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${cls}`}>
      {getEventStatusLabel(status)}
    </span>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const navigate = useNavigate()
  const [expandedRow, setExpandedRow]     = useState(null)
  const [viewMode, setViewMode]           = useState('calendar')
  const { events, fetchEvents, setSelectedEvent, selectedEvent } = useEventStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const myEvents = events.filter(e => isEventVisibleToFaculty(e, user))
  const pending  = myEvents.filter(e => normalizeEventStatus(e.status) === 'pending').length
  const approved = myEvents.filter(e => normalizeEventStatus(e.status) === 'approved').length
  const completed= myEvents.filter(e => normalizeEventStatus(e.status) === 'completed').length

  return (
    <PageWrapper>
      <div className="space-y-4 sm:space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary leading-tight">
              Dashboard Overview
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Manage and monitor your upcoming and past university events.
            </p>
          </div>
        </div>

        {/* ── Stat cards — 2 cols on mobile, 4 on desktop ─────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard label="My Events"        value={myEvents.length} icon={CalendarIcon} iconBg="bg-blue-100"   iconColor="text-blue-700"   valueColor="text-primary"      />
          <StatCard label="Pending Approval" value={pending}         icon={CheckSquare}  iconBg="bg-yellow-100" iconColor="text-yellow-700" valueColor="text-yellow-700"   />
          <StatCard label="Approved"         value={approved}        icon={CheckSquare}  iconBg="bg-green-100"  iconColor="text-green-700"  valueColor="text-green-700"    />
          <StatCard label="Completed"        value={completed}       icon={History}      iconBg="bg-purple-100" iconColor="text-purple-700" valueColor="text-purple-700"   />
        </div>

        {/* ── Calendar section ─────────────────────────────────────────── */}
        <section className="space-y-3">
          {/* Section header — stacks on mobile, row on sm+ */}
          <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <h3 className="flex items-center gap-2 text-sm sm:text-lg font-semibold text-primary">
              <CalendarIcon size={16} className="text-secondary shrink-0" />
              Event Calendar
            </h3>
            {/* Toggle — Calendar / List */}
            <div className="flex items-center bg-surface-container rounded-lg p-0.5 sm:p-1">
              {['calendar', 'list'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {mode === 'calendar' ? 'Calendar' : 'List'}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar view */}
          {viewMode === 'calendar' && (
            <Calendar events={myEvents} onEventClick={e => setSelectedEvent(e)} />
          )}

          {/* List view — scrollable table on mobile */}
          {viewMode === 'list' && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      {['Event', 'Date', 'Venue', 'Status'].map(h => (
                        <th key={h} className="px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {myEvents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                          No events yet.
                        </td>
                      </tr>
                    ) : myEvents.map(event => (
                      <tr key={event._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-primary max-w-[140px] truncate">{event.title}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap">{formatDateDMY(event.startDate)}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-on-surface-variant max-w-[120px] truncate">{event.venue}</td>
                        <td className="px-3 sm:px-4 py-2.5"><StatusBadge status={event.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── All events table ──────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm sm:text-lg font-semibold text-primary mb-2 sm:mb-3">All My Events</h3>

          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Event</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Venue</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-5 py-2.5 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {myEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : myEvents.map(event => {
                    const id = event._id || event.id
                    return (
                      <React.Fragment key={id}>
                        <tr
                          className="hover:bg-surface-container-low transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === id ? null : id)}
                        >
                          {/* Title */}
                          <td className="px-3 sm:px-5 py-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {expandedRow === id
                                ? <ChevronDown size={14} className="text-secondary shrink-0" />
                                : <ChevronRight size={14} className="text-on-surface-variant shrink-0" />
                              }
                              <span className="text-xs sm:text-sm font-semibold text-primary truncate max-w-[120px] sm:max-w-none">
                                {event.title}
                              </span>
                            </div>
                          </td>
                          {/* Type — hidden on mobile */}
                          <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap hidden sm:table-cell">
                            {event.category}
                          </td>
                          {/* Date */}
                          <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap">
                            {formatDateDMY(event.startDate)}
                          </td>
                          {/* Venue — hidden on small screens */}
                          <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant hidden md:table-cell">
                            <span className="truncate max-w-[140px] block">{event.venue}</span>
                          </td>
                          {/* Status */}
                          <td className="px-3 sm:px-5 py-3">
                            <StatusBadge status={event.status} />
                          </td>
                          {/* Actions */}
                          <td className="px-3 sm:px-5 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={e => { e.stopPropagation(); navigate(`/faculty/events/${id}/edit`) }}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={e => e.stopPropagation()}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
                                title="Settings"
                              >
                                <Settings size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded description row */}
                        {expandedRow === id && (
                          <tr className="bg-surface-container-low">
                            <td colSpan={6} className="px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-secondary">
                              <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                                Description
                              </p>
                              <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                                {event.description || 'No description provided.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

      {/* ── Event details modal ───────────────────────────────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setSelectedEvent(null)}
        >
          {/* Sheet on mobile (slides from bottom), centred card on sm+ */}
          <div
            className="bg-white w-full sm:w-auto sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-outline-variant">
              <h3 className="text-base font-bold text-primary leading-snug">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-on-surface-variant hover:text-primary shrink-0"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {[
                { label: 'Organizer', value: getEventCreatorName(selectedEvent.createdBy) },
                { label: 'Date',      value: selectedEvent.startDate ? `${formatDateDMY(selectedEvent.startDate)}${selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` to ${formatDateDMY(selectedEvent.endDate)}` : ''}` : '—' },
                { label: 'Time',      value: selectedEvent.time },
                { label: 'Venue',     value: selectedEvent.venue },
                { label: 'Category',  value: selectedEvent.category },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-on-surface-variant w-20 shrink-0 text-xs sm:text-sm">{label}:</span>
                  <span className="text-on-surface text-xs sm:text-sm">{value || '—'}</span>
                </div>
              ))}
              {selectedEvent.description && (
                <div className="text-sm pt-1">
                  <span className="font-semibold text-on-surface-variant text-xs sm:text-sm">Description:</span>
                  <p className="mt-1 text-on-surface text-xs sm:text-sm leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
              <div className="pt-1">
                <StatusBadge status={selectedEvent.status} />
              </div>
            </div>

            {/* Close button — mobile bottom */}
            <div className="sm:hidden px-5 pb-6 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 border border-outline-variant rounded-btn text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
