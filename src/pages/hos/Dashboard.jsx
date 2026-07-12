// src/pages/hos/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, ChevronRight, CalendarCheck, Plus } from 'lucide-react'
import axiosInstance from '../../config/axios'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import useEventStore from '../../store/eventStore'
import Calendar from '../../components/Calendar'

export default function HOSDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { events: allEvents, fetchEvents, setSelectedEvent } = useEventStore()
  const [viewMode, setViewMode] = useState('calendar')

  useEffect(() => {
    fetchPending()
    fetchEvents()
  }, [fetchEvents])

  const fetchPending = async () => {
    try {
      const res = await axiosInstance.get('/events/pending')
      setEvents(res.data.data)
    } catch (err) {
      toast.error('Failed to load pending events')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (eventId, action, remarks = '') => {
    try {
      await axiosInstance.post('/events/approve', { eventId, action, remarks })
      toast.success(`Event ${action}d successfully`)
      fetchPending()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Head of School Dashboard</h1>
            <p className="text-on-surface-variant mt-1">
              Events pending your final approval to go live
            </p>
          </div>
          <button
            onClick={() => navigate('/faculty/events/create')}
            className="flex items-center gap-2 bg-[#E87722] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E87722]/90 shadow-sm transition-all self-start sm:self-auto shrink-0"
          >
            <Plus size={16} />
            Create New Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-card rounded-card border border-outline-variant p-5">
            <div className="text-3xl font-bold text-[#E87722]">{events.length}</div>
            <div className="text-sm text-on-surface-variant mt-1">Awaiting Your Review</div>
          </div>
          <div className="bg-surface-card rounded-card border border-outline-variant p-5">
            <div className="text-3xl font-bold text-green-600">
              {events.filter(e => e.deanApproval?.status === 'approved').length}
            </div>
            <div className="text-sm text-on-surface-variant mt-1">Dean Approved</div>
          </div>
          <div className="bg-surface-card rounded-card border border-outline-variant p-5">
            <div className="text-3xl font-bold text-blue-600">
              {events.filter(e => e.eventType === 'club').length}
            </div>
            <div className="text-sm text-on-surface-variant mt-1">Club Events</div>
          </div>
        </div>

        {/* ── Calendar / List View ────────────────────────────────────────── */}
        <section className="space-y-3 mb-8">
          <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-primary">
              <CalendarCheck size={16} className="text-secondary shrink-0" />
              Event Calendar & Overview
            </h3>
            <div className="flex bg-surface-container-low border border-outline-variant rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                List
              </button>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant rounded-2xl p-3 sm:p-6 shadow-sm">
            {viewMode === 'calendar' ? (
              <Calendar events={allEvents} onEventClick={(e) => {
                setSelectedEvent(e)
                navigate(`/admin/events/${e._id}`)
              }} />
            ) : (
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
                    {allEvents.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">No events.</td></tr>
                    ) : allEvents.map(event => (
                      <tr key={event._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-primary max-w-[140px] truncate">{event.title}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-on-surface-variant whitespace-nowrap">
                          {new Date(event.startDate || event.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-on-surface-variant max-w-[120px] truncate">{event.venue}</td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap bg-blue-100 text-blue-700`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Pending approvals section title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-on-surface">Awaiting Your Approval</h2>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-surface-container animate-pulse rounded-card" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-surface-card rounded-card border border-outline-variant p-16 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-on-surface">All caught up!</h3>
            <p className="text-on-surface-variant mt-2">No events pending your approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <ApprovalEventCard
                key={event._id}
                event={event}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

// ── Approval Event Card ────────────────────────────────────────────────────────
function ApprovalEventCard({ event, onAction }) {
  const [showForm, setShowForm] = useState(null) // null | 'approve' | 'reject'
  const [remarks, setRemarks] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApprove = async () => {
    setProcessing(true)
    await onAction(event._id, 'approve', remarks)
    setProcessing(false)
    setShowForm(null)
  }

  const handleReject = async () => {
    if (!remarks.trim()) {
      alert('Please provide rejection remarks')
      return
    }
    setProcessing(true)
    await onAction(event._id, 'reject', remarks)
    setProcessing(false)
    setShowForm(null)
  }

  return (
    <div className="bg-surface-card rounded-card border border-outline-variant p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {event.eventType === 'club' && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {event.clubId?.name || 'Club Event'}
              </span>
            )}
            <span className="bg-[#E87722]/10 text-[#E87722] text-xs font-semibold px-2 py-0.5 rounded-full">
              {event.eventType === 'club' ? 'Club' : 'Regular'}
            </span>
          </div>
          <h3 className="font-bold text-lg text-on-surface truncate">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <CalendarIcon size={14} />
              {new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
            <span>📍 {event.venue}</span>
            <span>👤 {event.createdBy?.firstName} {event.createdBy?.lastName}</span>
          </div>

          {/* Approval chain progress */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StageChip label="Faculty" done />
            <div className="w-8 h-px bg-green-400 hidden sm:block" />
            <StageChip label="Admin" done />
            <div className="w-8 h-px bg-green-400 hidden sm:block" />
            <StageChip label="Dean" done />
            <div className="w-8 h-px bg-[#E87722] hidden sm:block" />
            <StageChip label="HOS" active />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
          {!showForm ? (
            <>
              <button
                onClick={() => { setShowForm('reject'); setRemarks('') }}
                disabled={processing}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-btn text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => { setShowForm('approve'); setRemarks('') }}
                disabled={processing}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-btn text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={16} />
                Approve → LIVE
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowForm(null)}
              className="text-sm text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Remarks Form */}
      {showForm && (
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <label className="block text-sm font-medium text-on-surface mb-2">
            {showForm === 'approve' ? 'Approval Remarks (Optional)' : 'Rejection Remarks'} <span className={showForm === 'reject' ? 'text-red-500' : 'text-slate-400'}>{showForm === 'reject' ? '*' : '(optional)'}</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder={showForm === 'approve' ? 'Enter approval comments (e.g. Approved and scheduled)...' : 'Provide clear reason for rejection...'}
            className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setShowForm(null)}
              className="px-4 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-btn hover:bg-surface-container"
            >
              Cancel
            </button>
            {showForm === 'approve' ? (
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-btn hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Approving...' : 'Confirm Approval'}
              </button>
            ) : (
              <button
                onClick={handleReject}
                disabled={processing || !remarks.trim()}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-btn hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StageChip({ label, done, active }) {
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
      ${done   ? 'bg-green-100 text-green-700 border border-green-300' :
        active ? 'bg-[#E87722]/10 text-[#E87722] border border-[#E87722]/40' :
                 'bg-surface-container text-on-surface-variant border border-outline-variant'}`}>
      {done && '✓ '}{label}
    </div>
  )
}
