import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdCalendarToday, MdCheckBox, MdPeople, MdTerminal, MdNotifications, MdDarkMode, MdAdd, MdDelete, MdEdit, MdSettings, MdChevronRight, MdExpandMore, MdPersonAdd, MdPersonRemove, MdTrendingUp, MdHistory, MdCancel, MdChevronLeft, MdEvent } from 'react-icons/md'
import PageWrapper from '../../components/layout/PageWrapper'
import Calendar from '../../components/Calendar'
import useEventStore from '../../store/eventStore'
import useAuthStore from '../../store/authStore'
import { getEventStatusLabel, getEventCreatorName, normalizeEventStatus, isEventVisibleToFaculty } from '../../utils/eventUtils'

export default function FacultyDashboard() {
  const navigate = useNavigate()
  const [expandedRow, setExpandedRow] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const { events, fetchEvents, setSelectedEvent, selectedEvent } = useEventStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const myEvents = events.filter((event) => isEventVisibleToFaculty(event, user))
  const pending = myEvents.filter((event) => normalizeEventStatus(event.status) === 'pending').length
  const approved = myEvents.filter((event) => normalizeEventStatus(event.status) === 'approved').length
  const completed = myEvents.filter((event) => normalizeEventStatus(event.status) === 'completed').length

  return (
    <PageWrapper>
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Welcome */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-primary">Dashboard Overview</h2>
            <p className="text-body-md text-on-surface-variant">Manage and monitor your upcoming and past university events.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
            <div>
              <p className="text-body-sm font-medium text-on-surface-variant">My Events</p>
              <h3 className="text-headline-lg text-[28px] font-bold text-primary mt-2">{myEvents.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <MdCalendarToday className="text-blue-700" size={24} />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
            <div>
              <p className="text-body-sm font-medium text-on-surface-variant">Pending Approval</p>
              <h3 className="text-headline-lg text-[28px] font-bold text-yellow-700 mt-2">{pending}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <MdCheckBox className="text-yellow-700" size={24} />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
            <div>
              <p className="text-body-sm font-medium text-on-surface-variant">Approved</p>
              <h3 className="text-headline-lg text-[28px] font-bold text-green-700 mt-2">{approved}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <MdCheckBox className="text-green-700" size={24} />
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
            <div>
              <p className="text-body-sm font-medium text-on-surface-variant">Completed</p>
              <h3 className="text-headline-lg text-[28px] font-bold text-purple-700 mt-2">{completed}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <MdHistory className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
              <MdEvent className="text-secondary" />
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
              events={myEvents} 
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
                  {myEvents.map(event => (
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

        {/* Events Table */}
        <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F1F5F9] border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider">Event Title</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 font-semibold text-on-surface-variant text-body-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {myEvents.map(event => (
                  <React.Fragment key={event.id}>
                    <tr 
                      className="hover:bg-surface-container-low transition-colors cursor-pointer" 
                      onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {expandedRow === event.id ? (
                            <MdExpandMore className="text-secondary" size={20} />
                          ) : (
                            <MdChevronRight className="text-on-surface-variant" size={20} />
                          )}
                          <span className="text-body-md font-semibold text-primary">{event.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-md">{event.category}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">{event.date}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">{event.venue}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                          normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-700' :
                          normalizeEventStatus(event.status) === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          normalizeEventStatus(event.status) === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {getEventStatusLabel(event.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                              <button
                            onClick={() => navigate(`/faculty/events/${event._id || event.id}/edit`)}
                            className="p-1.5 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"
                            title="Edit Event"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button className="p-1.5 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant">
                            <MdSettings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === event.id && (
                      <tr className="bg-surface-container-low shadow-inner">
                        <td className="px-6 py-6 border-l-4 border-secondary" colSpan="6">
                          <div className="text-on-surface-variant">
                            <p className="font-semibold mb-2">Description:</p>
                            <p>{event.description}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-headline-md font-headline-md text-primary">{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-on-surface-variant hover:text-primary">
                  <MdCancel size={24} />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-body-md text-on-surface"><strong>Organizer:</strong> {getEventCreatorName(selectedEvent.createdBy)}</p>
                <p className="text-body-md text-on-surface"><strong>Date:</strong> {selectedEvent.date}</p>
                <p className="text-body-md text-on-surface"><strong>Time:</strong> {selectedEvent.time}</p>
                <p className="text-body-md text-on-surface"><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p className="text-body-md text-on-surface"><strong>Category:</strong> {selectedEvent.category}</p>
                <p className="text-body-md text-on-surface"><strong>Description:</strong> {selectedEvent.description}</p>
                <div className="mt-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                    normalizeEventStatus(selectedEvent.status) === 'approved' ? 'bg-green-100 text-green-700' :
                    normalizeEventStatus(selectedEvent.status) === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getEventStatusLabel(selectedEvent.status)}
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
