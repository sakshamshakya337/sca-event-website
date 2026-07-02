import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { normalizeEventStatus } from '../utils/eventUtils'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// Full day names for ≥ sm, single letter for mobile
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getEventColor(event) {
  const s = normalizeEventStatus(event.status)
  if (s === 'approved')  return 'bg-green-500  text-white'
  if (s === 'pending')   return 'bg-amber-500  text-white'
  if (s === 'rejected')  return 'bg-red-500    text-white'
  return 'bg-violet-500 text-white'
}

function normalizeDate(val) {
  if (!val) return ''
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? val : d.toISOString().split('T')[0]
  } catch { return val }
}

export default function Calendar({ events = [], onEventClick }) {
  const [current, setCurrent] = useState(new Date())

  const year  = current.getFullYear()
  const month = current.getMonth()

  const firstWeekday  = new Date(year, month, 1).getDay()
  const daysInMonth   = new Date(year, month + 1, 0).getDate()
  const prevLastDay   = new Date(year, month, 0).getDate()
  const totalCells    = 42

  // Build flat cell array: { day, type: 'prev'|'cur'|'next' }
  const cells = []
  for (let i = firstWeekday - 1; i >= 0; i--)
    cells.push({ day: prevLastDay - i, type: 'prev' })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: 'cur' })
  while (cells.length < totalCells)
    cells.push({ day: cells.length - firstWeekday - daysInMonth + 1, type: 'next' })

  const getEventsForDay = (day) => {
    const target = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => normalizeDate(e.date) === target)
  }

  const today = new Date().toDateString()

  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">

      {/* ── Month navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="p-1.5 sm:p-2 hover:bg-surface-container-high rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="p-1.5 sm:p-2 hover:bg-surface-container-high rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
          <h3 className="text-sm sm:text-base font-semibold text-on-surface ml-1">
            {MONTH_NAMES[month]} {year}
          </h3>
        </div>
        <button
          onClick={() => setCurrent(new Date())}
          className="px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* ── Day-of-week header ───────────────────────────────────────────── */}
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-1.5 sm:py-2 text-center">
            {/* Single initial on mobile, abbreviation on sm+ */}
            <span className="sm:hidden text-[10px] font-bold text-on-surface-variant uppercase">{d[0]}</span>
            <span className="hidden sm:block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{d}</span>
          </div>
        ))}
      </div>

      {/* ── Calendar grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 divide-x divide-y divide-outline-variant">
        {cells.map((cell, idx) => {
          if (cell.type !== 'cur') {
            return (
              <div
                key={idx}
                className="bg-[#F8FAFC] p-1 text-right"
                style={{ minHeight: 'clamp(40px, 10vw, 100px)' }}
              >
                <span className="text-[10px] sm:text-xs text-on-surface-variant/40">{cell.day}</span>
              </div>
            )
          }

          const dayEvents = getEventsForDay(cell.day)
          const isToday   = new Date(year, month, cell.day).toDateString() === today

          return (
            <div
              key={idx}
              className={`p-1 overflow-hidden ${isToday ? 'bg-blue-50' : 'bg-white'}`}
              style={{ minHeight: 'clamp(48px, 12vw, 110px)' }}
            >
              {/* Day number */}
              <div className={`text-right text-[10px] sm:text-xs font-medium mb-0.5 ${
                isToday ? 'text-blue-600 font-bold' : 'text-on-surface-variant'
              }`}>
                {isToday ? (
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold">
                    {cell.day}
                  </span>
                ) : cell.day}
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event._id}
                    onClick={() => onEventClick?.(event)}
                    title={event.title}
                    className={`
                      text-[9px] sm:text-[11px] leading-tight font-semibold
                      rounded px-1 py-0.5 sm:px-1.5 sm:py-1
                      truncate cursor-pointer hover:opacity-80 transition-opacity
                      ${getEventColor(event)}
                    `}
                  >
                    {/* On mobile show only first word to save space */}
                    <span className="sm:hidden">{event.title.split(' ')[0]}</span>
                    <span className="hidden sm:inline">{event.title}</span>
                  </div>
                ))}
                {/* Overflow indicator */}
                {dayEvents.length > 3 && (
                  <p className="text-[9px] sm:text-[10px] text-on-surface-variant/60 px-1 font-medium">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
