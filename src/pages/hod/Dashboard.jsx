import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, CalendarCheck, Calendar as CalendarIcon, Plus } from 'lucide-react'
import axiosInstance from '../../config/axios'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'
import Calendar from '../../components/Calendar'

export default function HodDashboard() {
  const [events, setEvents] = useState([])
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events') // 'events' or 'galleries'
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const [eventsRes, galleriesRes] = await Promise.all([
        axiosInstance.get('/events?status=pending_hod'),
        axiosInstance.get('/galleries?status=pending_hod')
      ])
      // Filter out only the ones where currentApprover matches the logged in user, or handled in backend.
      setEvents(eventsRes.data.data)
      setGalleries(galleriesRes.data.data?.galleries || galleriesRes.data.data || [])
    } catch (err) {
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (type, id, action, remarks = '') => {
    try {
      const endpoint = type === 'event' ? `/events/${id}/${action}` : `/galleries/${id}/${action}`
      await axiosInstance.put(endpoint, { remarks, reason: remarks })
      toast.success(`${type === 'event' ? 'Event' : 'Gallery'} ${action}d successfully`)
      fetchPending()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface">HOD Dashboard</h1>
          <p className="text-on-surface-variant mt-1">
            Review Events and Event Reports (Gallery) pending your department approval.
          </p>
        </div>

        {/* Events vs Galleries Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-outline-variant gap-4">
          <div className="flex space-x-4">
            <button 
              className={`py-2 px-4 font-semibold ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
              onClick={() => setActiveTab('events')}
            >
              Pending Events ({events.length})
            </button>
            <button 
              className={`py-2 px-4 font-semibold ${activeTab === 'galleries' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
              onClick={() => setActiveTab('galleries')}
            >
              Pending Gallery Reports ({galleries.length})
            </button>
          </div>
          
          {activeTab === 'events' && (
            <div className="flex bg-surface-container-low border border-outline-variant rounded-lg p-0.5 shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Calendar View
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-8"><span className="animate-spin text-primary">Loading...</span></div>
        ) : activeTab === 'events' ? (
          viewMode === 'calendar' ? (
             <div className="bg-surface border border-outline-variant rounded-2xl p-3 sm:p-6 shadow-sm mb-8">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-primary mb-4">
                  <CalendarCheck size={16} className="text-secondary shrink-0" />
                  Pending Events Calendar
                </h3>
                <Calendar events={events} onEventClick={(e) => {
                  // Optionally, we could scroll to the event card, or navigate somewhere.
                  // For now, setting active tab back to list will show it in list.
                  setViewMode('list');
                  toast(`Found ${e.title} in list!`);
                }} />
             </div>
          ) : (
            events.length === 0 ? (
              <div className="text-center py-12 bg-surface-card rounded-xl border border-outline-variant">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-on-surface">No Pending Events</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <ApprovalCard key={event._id} item={event} type="event" onAction={handleAction} />
                ))}
              </div>
            )
          )
        ) : (
          galleries.length === 0 ? (
            <div className="text-center py-12 bg-surface-card rounded-xl border border-outline-variant">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-on-surface">No Pending Gallery Reports</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {galleries.map(gallery => (
                <ApprovalCard key={gallery._id} item={gallery} type="gallery" onAction={handleAction} />
              ))}
            </div>
          )
        )}
      </div>
    </PageWrapper>
  )
}

function ApprovalCard({ item, type, onAction }) {
  const [remarks, setRemarks] = useState('')
  const [processing, setProcessing] = useState(false)

  const submitAction = async (action) => {
    if (action === 'reject' && !remarks.trim()) {
      alert('Please provide rejection remarks')
      return
    }
    setProcessing(true)
    await onAction(type, item._id, action, remarks)
    setProcessing(false)
  }

  return (
    <div className="bg-surface-card rounded-xl border border-outline-variant p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-on-surface">{item.title}</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Submitted by: {item.createdBy?.firstName} {item.createdBy?.lastName}
          </p>
          {type === 'event' && (
            <p className="text-sm text-on-surface-variant mt-1">
              Date: {new Date(item.startDate).toLocaleDateString()} | Venue: {item.venue}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-outline-variant">
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          rows={2}
          placeholder="Enter remarks (required for rejection)..."
          className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface mb-3"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => submitAction('reject')}
            disabled={processing}
            className="px-4 py-2 text-sm font-semibold border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            Reject
          </button>
          <button
            onClick={() => submitAction('approve')}
            disabled={processing}
            className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
