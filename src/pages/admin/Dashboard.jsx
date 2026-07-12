import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import Calendar from '../../components/Calendar'
import {
  Plus, HelpCircle, XCircle, ClipboardList, Mail,
  CalendarCheck, Edit, CheckCircle2, X,
} from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useAdminUserStore from '../../store/adminUserStore'
import useAdminQueriesStore from '../../store/adminQueriesStore'
import { Link, useNavigate } from 'react-router-dom'
import { getEventCreatorName, getEventStatusLabel, normalizeEventStatus, formatDateDMY } from '../../utils/eventUtils'

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

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-3 sm:p-5 relative overflow-hidden shadow-sm">
      <p className="text-[10px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider leading-tight">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2 leading-none">{value}</p>
      <div className={`absolute bottom-0 left-0 w-full h-1 ${accent}`} />
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconColor, title, action }) {
  return (
    <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-outline-variant">
      <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-primary">
        <Icon size={16} className={iconColor} />
        {title}
      </h3>
      {action}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { events, fetchEvents, approveEvent, rejectEvent, setSelectedEvent, selectedEvent } = useEventStore()
  const { users }   = useAdminUserStore()
  const { queries, fetchQueries } = useAdminQueriesStore()

  const [pendingAction, setPendingAction] = useState(null) // { eventId, type: 'approve' | 'reject' }
  const [actionRemarks, setActionRemarks] = useState('')
  const [viewMode, setViewMode]                 = useState('calendar')

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { if (!queries.length) fetchQueries() }, [fetchQueries, queries.length])

  const actionablePendingEvents = events.filter(e => e.status === 'pending' || e.status === 'pending_admin')
  const pendingEvents  = events.filter(e => normalizeEventStatus(e.status) === 'pending')
  const approvedEvents = events.filter(e => normalizeEventStatus(e.status) === 'approved' || e.status === 'pending_dean' || e.status === 'pending_hos')
  const recentQueries  = queries.slice(0, 4)

  return (
    <PageWrapper>
      <div className="space-y-4 sm:space-y-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-primary leading-tight">Dashboard Overview</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Real-time management and administrative oversight.
            </p>
          </div>
        </div>

        {/* ── Stats — 2×3 on mobile, 5 cols on lg ────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          <StatCard label="Total Events" value={events.length}                                accent="bg-primary" />
          <StatCard label="Pending"      value={pendingEvents.length}                         accent="bg-yellow-400" />
          <StatCard label="Approved"     value={approvedEvents.length}                        accent="bg-green-500" />
          <StatCard label="Faculty"      value={users.filter(u => u.role === 'faculty').length} accent="bg-violet-500" />
          <StatCard label="Students"     value={users.filter(u => u.role === 'student').length} accent="bg-sky-400" />
        </div>

        {/* ── Calendar ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-primary">
              <CalendarCheck size={16} className="text-secondary shrink-0" />
              Event Calendar
            </h3>
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

          {viewMode === 'calendar' && (
            <Calendar events={events} onEventClick={e => setSelectedEvent(e)} />
          )}

          {viewMode === 'list' && (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      {['Event','Date','Venue','Status'].map(h => (
                        <th key={h} className="px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {events.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">No events.</td></tr>
                    ) : events.map(event => (
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

        {/* ── Pending approvals table ──────────────────────────────────── */}
        <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <SectionHeader
            icon={ClipboardList}
            iconColor="text-secondary"
            title="Pending Approvals"
            action={
              <Link to="/admin/events" className="text-xs sm:text-sm text-secondary font-semibold hover:underline">
                View All
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Event</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Organizer</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">

                {/* Pending rows */}
                {actionablePendingEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-on-surface-variant">
                      No events to review.
                    </td>
                  </tr>
                )}

                {actionablePendingEvents.map(event => (
                  <React.Fragment key={event._id}>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold text-primary max-w-[140px] sm:max-w-none truncate">
                        {event.title}
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant hidden sm:table-cell">
                        {getEventCreatorName(event.createdBy)}
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap hidden md:table-cell">
                        {formatDateDMY(event.startDate)}
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setPendingAction({ eventId: event._id, type: 'approve' })
                              setActionRemarks('')
                            }}
                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-[10px] sm:text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setPendingAction({ eventId: event._id, type: 'reject' })
                              setActionRemarks('')
                            }}
                            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-[10px] sm:text-xs font-bold transition-colors"
                          >
                            <X size={12} />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline confirm/remarks prompt */}
                    {pendingAction && pendingAction.eventId === event._id && (
                      <tr className="bg-primary/5">
                        <td colSpan={5} className="px-3 sm:px-5 py-3">
                          <div className="flex flex-col gap-2 bg-surface-container-high border border-outline-variant p-4 rounded-xl">
                            <p className="text-xs sm:text-sm font-semibold text-primary">
                              {pendingAction.type === 'approve' ? 'Approve' : 'Reject'} event <strong>"{event.title}"</strong>?
                            </p>
                            <textarea
                              value={actionRemarks}
                              onChange={e => setActionRemarks(e.target.value)}
                              placeholder={`Enter ${pendingAction.type === 'approve' ? 'approval remarks (optional)' : 'rejection remarks (required)'}...`}
                              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-xs bg-surface resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setPendingAction(null)}
                                className="px-3 py-1 border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  if (pendingAction.type === 'reject' && !actionRemarks.trim()) {
                                    alert('Rejection remarks are required')
                                    return
                                  }
                                  if (pendingAction.type === 'approve') {
                                    await approveEvent(event._id, actionRemarks)
                                  } else {
                                    await rejectEvent(event._id, actionRemarks)
                                  }
                                  setPendingAction(null)
                                }}
                                className={`px-3 py-1 text-white text-xs font-bold rounded-lg transition-colors ${pendingAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {/* Approved rows (dimmed) */}
                {approvedEvents.map(event => (
                  <tr key={event._id} className="opacity-50 hover:opacity-70 transition-opacity hover:bg-surface-container">
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold text-primary max-w-[140px] sm:max-w-none truncate">
                      {event.title}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant hidden sm:table-cell">
                      {getEventCreatorName(event.createdBy)}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap hidden md:table-cell">
                      {event.startDate}
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/events/${event._id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </section>

        {/* ── Recent contact queries ───────────────────────────────────── */}
        <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <SectionHeader
            icon={Mail}
            iconColor="text-violet-500"
            title="Recent Contact Queries"
            action={
              <Link to="/admin/queries" className="text-xs sm:text-sm text-secondary font-semibold hover:underline">
                View All
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-5 py-2.5 text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentQueries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-on-surface-variant">
                      No queries yet.
                    </td>
                  </tr>
                ) : recentQueries.map(query => (
                  <tr key={query._id || query.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold text-primary">
                      <div className="max-w-[120px] sm:max-w-none truncate">{query.name}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5 sm:hidden">{query.category}</div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant hidden sm:table-cell">
                      {query.category}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap hidden md:table-cell">
                      {query.date}
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${
                        query.status === 'pending'     ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                        query.status === 'in_progress' ? 'border-blue-200   bg-blue-50   text-blue-700'   :
                        query.status === 'resolved'    ? 'border-green-200  bg-green-50  text-green-700'  :
                        'border-outline-variant bg-surface text-on-surface-variant'
                      }`}>
                        {query.status === 'pending' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shrink-0" />
                        )}
                        {query.status === 'pending'     ? 'Pending'     :
                         query.status === 'in_progress' ? 'In Progress' :
                         query.status === 'resolved'    ? 'Resolved'    : query.status}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right">
                      <Link
                        to="/admin/queries"
                        className="inline-flex items-center px-2.5 sm:px-3 py-1 border border-outline-variant rounded-lg text-[10px] sm:text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* ── Event detail modal (bottom sheet on mobile) ─────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white w-full sm:w-auto sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-outline-variant">
              <h3 className="text-sm sm:text-base font-bold text-primary leading-snug">
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
            <div className="px-5 sm:px-6 py-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {[
                { label: 'Organizer', value: getEventCreatorName(selectedEvent.createdBy) },
                { label: 'Date',      value: selectedEvent.startDate ? `${selectedEvent.startDate}${selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` to ${selectedEvent.endDate}` : ''}` : '—' },
                { label: 'Time',      value: selectedEvent.time },
                { label: 'Venue',     value: selectedEvent.venue },
                { label: 'Category',  value: selectedEvent.category },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant w-20 shrink-0">{label}:</span>
                  <span className="text-xs text-on-surface">{value || '—'}</span>
                </div>
              ))}
              {selectedEvent.description && (
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant">Description:</span>
                  <p className="text-xs text-on-surface mt-1 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
              <div className="pt-1">
                <StatusBadge status={selectedEvent.status} />
              </div>
            </div>

            {/* Mobile close */}
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
