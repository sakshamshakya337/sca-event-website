import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdStar, MdStarBorder, MdLocationOn, MdEvent } from 'react-icons/md'
import useEventStore from '../../store/eventStore'

export default function MyEvents() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'All') return true
    return event.status === activeFilter
  })

  const categoryColors = {
    Cultural: 'bg-secondary-fixed text-on-secondary-fixed',
    Workshop: 'bg-tertiary-fixed text-on-tertiary-fixed',
    Sports: 'bg-orange-100 text-orange-800',
    Technical: 'bg-blue-100 text-blue-800',
    Seminar: 'bg-purple-100 text-purple-800'
  }

  const statusStyles = {
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Completed: 'bg-surface-container-highest text-on-surface-variant border-outline-variant'
  }

  return (
    <PageWrapper>
      {/* Filters */}
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
              {filter} <span className="ml-1 opacity-60">{events.length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
          <MdEvent className="text-[18px]" />
          <span>Academic Cycle 2025-26</span>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant">
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Event Name</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Category</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Date & Venue</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Status</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {filteredEvents.map(event => (
              <tr
                key={event._id}
                className="hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => navigate(`/student/events/${event._id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {event.isImportant ? (
                      <MdStar className="text-amber-500" />
                    ) : (
                      <MdStarBorder className="text-outline-variant" />
                    )}
                    <div>
                      <p className={`font-semibold text-primary ${event.status === 'Completed' ? 'text-opacity-60' : ''}`}>
                        {event.title}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 ${categoryColors[event.category] || categoryColors.Workshop} rounded text-[11px] font-bold uppercase tracking-wider`}>
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-body-sm ${event.status === 'Completed' ? 'text-on-surface-variant' : ''}`}>
                    <p className="font-medium">{event.date}</p>
                    <p className="text-on-surface-variant flex items-center gap-1">
                      <MdLocationOn className="text-[14px]" /> {event.venue}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-body-sm font-semibold border ${statusStyles[event.status]}`}>
                    {event.status === 'Approved' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    {event.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-secondary hover:underline font-semibold">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
