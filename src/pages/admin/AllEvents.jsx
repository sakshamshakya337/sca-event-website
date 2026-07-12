import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { Search, CheckCircle2, XCircle, Trash2, MapPin, CalendarDays, Tag, Eye, ImageOff } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import { getEventStatusLabel, normalizeEventStatus } from '../../utils/eventUtils'

const categoryColors = {
  Workshop: 'bg-blue-100 text-blue-800',
  Seminar: 'bg-purple-100 text-purple-800',
  Cultural: 'bg-pink-100 text-pink-800',
  Sports: 'bg-orange-100 text-orange-800',
  Technical: 'bg-cyan-100 text-cyan-800',
  Other: 'bg-gray-100 text-gray-800',
}

const statusConfig = {
  approved: { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending:  { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  rejected: { cls: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500' },
  completed:{ cls: 'bg-gray-50 text-gray-600 border-gray-200',     dot: 'bg-gray-400' },
}

export default function AllEvents() {
  const { events, fetchEvents, approveEvent, rejectEvent, deleteEvent } = useEventStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = events.filter(event => {
    const normalizedStatus = normalizeEventStatus(event.status)
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || normalizedStatus === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const counts = {
    All: events.length,
    Pending: events.filter(e => normalizeEventStatus(e.status) === 'pending').length,
    Approved: events.filter(e => normalizeEventStatus(e.status) === 'approved').length,
    Rejected: events.filter(e => normalizeEventStatus(e.status) === 'rejected').length,
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-on-surface">All Events</h2>
            <p className="text-body-md text-on-surface-variant">Manage and approve events from faculty.</p>
          </div>
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex bg-surface-container p-1 rounded-xl">
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  statusFilter === f
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {f}
                <span className="ml-1.5 text-xs opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Event Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-xl p-16 text-center">
            <CalendarDays size={48} className="mx-auto text-on-surface-variant opacity-30 mb-4" />
            <p className="text-on-surface-variant text-body-md">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map(event => {
              const status = normalizeEventStatus(event.status)
              const cfg = statusConfig[status] || statusConfig.pending
              const catCls = categoryColors[event.type || event.category] || categoryColors.Other

              return (
                <div
                  key={event._id}
                  className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => navigate(`/admin/events/${event.slug || event._id}`)}
                >
                  {/* Banner Image */}
                  <div className="relative h-44 bg-surface-container-high overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-container to-surface-container-high">
                        <ImageOff size={32} className="text-outline-variant" />
                        <span className="text-xs text-on-surface-variant">No image</span>
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-sm ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {getEventStatusLabel(event.status)}
                      </span>
                    </div>
                    {/* Category badge */}
                    {(event.type || event.category) && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${catCls}`}>
                          {event.type || event.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} className="shrink-0 text-outline" />
                        <span>{event.startDate ? `${new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${event.endDate && event.endDate !== event.startDate ? ` - ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="shrink-0 text-outline" />
                        <span className="truncate">{event.venue || '—'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="mt-4 flex items-center gap-2 border-t border-outline-variant/50 pt-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/admin/events/${event.slug || event._id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors border border-outline-variant"
                      >
                        <Eye size={13} /> View
                      </button>

                      {(event.status === 'pending' || event.status === 'pending_admin') && (
                        <>
                          <button
                            onClick={() => approveEvent(event._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => rejectEvent(event._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="p-1.5 rounded-lg text-error hover:bg-red-50 transition-colors border border-outline-variant/50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
