import React, { useState } from 'react'
import { Calendar as CalendarIcon,ChevronLeft, ChevronRight } from 'lucide-react'
import { normalizeEventStatus } from '../utils/eventUtils'

export default function Calendar({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get first and last day of the month
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay()

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const prevMonthDays = []
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i)
  }

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Next month days
  const totalCells = prevMonthDays.length + currentMonthDays.length
  const nextMonthDays = Array.from({ length: 42 - totalCells }, (_, i) => i + 1)

  // Helper to normalize event date to YYYY-MM-DD format
  const normalizeDate = (dateValue) => {
    if (!dateValue) return ''
    try {
      const dateObj = new Date(dateValue)
      if (isNaN(dateObj.getTime())) {
        // Try parsing as-is if it's already a string
        return dateValue
      }
      return dateObj.toISOString().split('T')[0]
    } catch (e) {
      return dateValue
    }
  }

  // Helper to check if a date has events
  const getEventsForDate = (day, isCurrentMonth = true) => {
    if (!isCurrentMonth) return []
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => normalizeDate(event.date) === targetDate)
  }

  // Helper to get event color
  const getEventColor = (event) => {
    const status = normalizeEventStatus(event.status)
    if (status === 'approved') return 'bg-green-500 text-white'
    if (status === 'pending') return 'bg-secondary text-white'
    return 'bg-[#8B5CF6] text-white'
  }

  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <h3 className="text-lg font-semibold text-on-surface ml-2">
            {monthNames[month]} {year}
          </h3>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-1.5 text-sm font-medium text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-bold text-on-surface-variant uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-5 min-h-[600px] divide-x divide-y divide-outline-variant">
        {/* Previous month days */}
        {prevMonthDays.map(day => (
          <div
            key={`prev-${day}`}
            className="bg-[#F8FAFC] p-1 text-right text-xs text-on-surface-variant/50"
          >
            {day}
          </div>
        ))}

        {/* Current month days */}
        {currentMonthDays.map(day => {
          const dayEvents = getEventsForDate(day)
          const isToday =
            new Date().toDateString() ===
            new Date(year, month, day).toDateString()
          
          return (
            <div
              key={`current-${day}`}
              className={`bg-white p-1 space-y-1 min-h-[100px] overflow-y-auto ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-right text-sm font-medium ${isToday ? 'text-blue-600' : 'text-on-surface-variant'}`}>
                {day}
              </div>
              {dayEvents.length > 0 ? (
                dayEvents.map(event => (
                  <div
                    key={event._id}
                    onClick={() => onEventClick && onEventClick(event)}
                    className={`text-[11px] px-2 py-1.5 rounded-md truncate font-semibold cursor-pointer hover:opacity-80 shadow-sm ${getEventColor(event)}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-on-surface-variant/30 px-1">-</div>
              )}
            </div>
          )
        })}

        {/* Next month days */}
        {nextMonthDays.map(day => (
          <div
            key={`next-${day}`}
            className="bg-[#F8FAFC] p-1 text-right text-xs text-on-surface-variant/50"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}
