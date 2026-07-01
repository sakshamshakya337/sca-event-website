import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import Calendar from '../../components/Calendar'
import { Plus, Bell, MoreHorizontal, HelpCircle, CheckCircle2, XCircle, Star, ChevronRight, CalendarCheck, Users, UserCheck, Mail, ClipboardList, ChevronLeft, Eye, Edit } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useAdminUserStore from '../../store/adminUserStore'
import useAdminVerifyStore from '../../store/adminVerifyStore'
import useAdminQueriesStore from '../../store/adminQueriesStore'
import { Link, useNavigate } from 'react-router-dom'
import { getEventCreatorName, getEventStatusLabel, normalizeEventStatus } from '../../utils/eventUtils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { events, fetchEvents, approveEvent, rejectEvent, setSelectedEvent, selectedEvent } = useEventStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])
  const { users } = useAdminUserStore()
  const { verifications } = useAdminVerifyStore()
  const { queries, fetchQueries } = useAdminQueriesStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [pendingEventId, setPendingEventId] = useState(null)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Calculate stats
  const pendingEvents = events.filter(event => normalizeEventStatus(event.status) === 'pending').length
  const approvedEvents = events.filter(event => normalizeEventStatus(event.status) === 'approved').length
  const totalEvents = events.length
  const totalUsers = users.length

  // Recent items
  useEffect(() => {
    if (!queries.length) fetchQueries()
  }, [fetchQueries, queries.length])

  const recentQueries = queries.slice(0, 3)
  const pendingEventsList = events.filter(event => normalizeEventStatus(event.status) === 'pending')

  return (
    <PageWrapper>
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-headline-lg text-primary">Dashboard Overview</h2>
            <p className="text-body-md text-on-surface-variant">Real-time management and administrative oversight.</p>
          </div>
          <button 
          onClick={() => {
            console.log('Dashboard Create Event clicked')
            navigate('/faculty/events/create')
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-body-md font-semibold rounded-btn shadow-md hover:opacity-90 transition-all active:scale-95"
        >
          <Plus size={16} />
          Create New Event
        </button>
        </div>

        {/* 1. Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-5 relative overflow-hidden stat-card-shadow">
            <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Total Events</p>
            <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{totalEvents}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-5 relative overflow-hidden stat-card-shadow">
            <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Pending</p>
            <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{pendingEvents}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary-container"></div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-5 relative overflow-hidden stat-card-shadow">
            <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Approved</p>
            <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{approvedEvents}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-5 relative overflow-hidden stat-card-shadow">
            <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Faculty</p>
            <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{users.filter(u => u.role === 'faculty').length}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#8B5CF6]"></div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-5 relative overflow-hidden stat-card-shadow">
            <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Students</p>
            <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{users.filter(u => u.role === 'student').length}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary-container"></div>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
              <CalendarCheck className="text-secondary" />
              Event Calendar
            </h3>
            <div className="flex items-center bg-surface-container rounded-lg p-1">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-1.5 rounded-md text-body-sm font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 rounded-md text-body-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                List
              </button>
            </div>
          </div>
          {viewMode === 'calendar' ? (
            <Calendar 
              events={events} 
              onEventClick={(event) => setSelectedEvent(event)} 
            />
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3 text-body-sm font-semibold text-on-surface-variant">Event</th>
                    <th className="px-4 py-3 text-body-sm font-semibold text-on-surface-variant">Date</th>
                    <th className="px-4 py-3 text-body-sm font-semibold text-on-surface-variant">Venue</th>
                    <th className="px-4 py-3 text-body-sm font-semibold text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {events.map(event => (
                    <tr key={event._id} className="hover:bg-surface-container transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">{event.title}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{event.date}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{event.venue}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                          normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-700' :
                          normalizeEventStatus(event.status) === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {normalizeEventStatus(event.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Pending Approvals */}
          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                <ClipboardList size={18} className="text-secondary" />
                Pending Approvals
              </h3>
              <Link 
                to="/admin/events"
                className="text-secondary font-medium text-body-sm hover:underline"
              >
                View All Requests
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F1F5F9] border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Event Name</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {pendingEventsList.map((event, index) => (
                    <React.Fragment key={event._id}>
                      <tr className={index === 0 ? 'bg-surface-container-low transition-colors' : 'hover:bg-surface-container transition-colors'}>
                        <td className="px-6 py-4 font-medium text-primary">{event.title}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{getEventCreatorName(event.createdBy)}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{event.date}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase">{getEventStatusLabel(event.status)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {index === 0 ? (
                            <button onClick={() => setPendingEventId(event._id)} className="text-secondary-container">
                              <MoreHorizontal size={20} />
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => approveEvent(event._id)}
                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectEvent(event._id)}
                                className="bg-error-container text-on-error-container hover:bg-red-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {index === 0 && pendingEventId === event._id && (
                        <tr className="bg-primary/5">
                          <td className="px-6 py-3" colSpan="5">
                            <div className="flex items-center justify-between bg-primary-container text-white px-4 py-2 rounded-lg">
                              <p className="text-body-sm flex items-center gap-2">
                                <HelpCircle size={18} />
                                Approve '{event.title}' by {getEventCreatorName(event.createdBy)}?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    approveEvent(event._id)
                                    setPendingEventId(null)
                                  }}
                                  className="px-3 py-1 bg-white text-primary text-xs font-bold rounded hover:bg-surface-variant"
                                >
                                  Confirm Approval
                                </button>
                                <button
                                  onClick={() => setPendingEventId(null)}
                                  className="px-3 py-1 bg-transparent border border-white/30 text-white text-xs font-bold rounded hover:bg-white/10"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {events.filter(e => normalizeEventStatus(e.status) === 'approved').map((event, index) => (
                    <tr key={event._id} className="hover:bg-surface-container transition-colors opacity-60">
                      <td className="px-6 py-4 font-medium text-primary">{event.title}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{getEventCreatorName(event.createdBy)}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{event.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[11px] font-bold uppercase">Approved</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/events/${event._id || event.id}/edit`)}
                          className="text-on-surface-variant"
                          title="Edit Event"
                        >
                          <Edit size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Queries */}
          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                <Mail className="text-[#8B5CF6]" />
                Recent Contact Queries
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F1F5F9] border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 font-semibold text-on-surface text-body-sm uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recentQueries.map(query => (
                    <tr key={query.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{query.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-code-sm text-code-sm bg-surface-container-high px-2 py-1 rounded">{query.universityId}</span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{query.category}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{query.date}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-outline-variant/20 w-fit ${
                          query.status === 'pending' ? 'text-secondary' : 'text-on-surface-variant'
                        }`}>
                          {query.status === 'pending' && <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>}
                          <span className="text-body-sm font-bold">{query.status === 'pending' ? 'Pending' : query.status === 'in_progress' ? 'In Progress' : query.status === 'resolved' ? 'Resolved' : query.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-1.5 border border-outline-variant rounded-lg text-body-sm font-medium hover:bg-surface-variant transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-headline-md font-headline-md text-primary">{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-on-surface-variant hover:text-primary">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-body-md text-on-surface"><strong>Organizer:</strong> {selectedEvent.createdBy}</p>
                <p className="text-body-md text-on-surface"><strong>Date:</strong> {selectedEvent.date}</p>
                <p className="text-body-md text-on-surface"><strong>Time:</strong> {selectedEvent.time}</p>
                <p className="text-body-md text-on-surface"><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p className="text-body-md text-on-surface"><strong>Category:</strong> {selectedEvent.category}</p>
                <p className="text-body-md text-on-surface"><strong>Description:</strong> {selectedEvent.description}</p>
                <div className="mt-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    selectedEvent.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    selectedEvent.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
