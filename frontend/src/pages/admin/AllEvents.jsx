import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdSearch, MdCheckCircle, MdCancel, MdDelete } from 'react-icons/md'
import useEventStore from '../../store/eventStore'
import { getEventStatusLabel, normalizeEventStatus } from '../../utils/eventUtils'

export default function AllEvents() {
  const { events, fetchEvents, approveEvent, rejectEvent, deleteEvent } = useEventStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = events.filter(event => {
    const normalizedStatus = normalizeEventStatus(event.status)
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || normalizedStatus === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-headline-lg text-on-surface">All Events</h2>
            <p className="text-body-md text-on-surface-variant">Manage and approve events from faculty and students.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              placeholder="Search events..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Event</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => navigate(`/admin/events/${event._id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-primary text-xl font-bold">
                          {event.title[0]}
                        </div>
                        <div>
                          <div className="text-body-md font-semibold text-on-surface">{event.title}</div>
                          <div className="text-body-sm text-on-surface-variant">{event.venue}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{event.date}</td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{event.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-700' :
                        normalizeEventStatus(event.status) === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {getEventStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {normalizeEventStatus(event.status) === 'pending' && (
                          <>
                            <button 
                              onClick={() => approveEvent(event._id)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                              title="Approve"
                            >
                              <MdCheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => rejectEvent(event._id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                              title="Reject"
                            >
                              <MdCancel size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => deleteEvent(event._id)}
                          className="p-2 bg-surface-container text-error rounded-lg hover:bg-error/10 transition-all"
                          title="Delete"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
