import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { CalendarCheck, CheckSquare, CheckCircle2, Clock } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useTaskStore from '../../store/taskStore'
import { normalizeEventStatus, getEventStatusLabel } from '../../utils/eventUtils'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch { return dateStr }
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const { myTasks, getMyTasks } = useTaskStore()

  useEffect(() => {
    fetchEvents()
    getMyTasks()
  }, [fetchEvents, getMyTasks])

  const pendingTasks = myTasks.filter(t => !t.isDone).length
  const completedTasks = myTasks.filter(t => t.isDone).length

  const statusBadge = (status) => {
    const s = normalizeEventStatus(status)
    const cls =
      s === 'approved' ? 'bg-green-100 text-green-700' :
      s === 'pending'  ? 'bg-amber-100 text-amber-700' :
      'bg-surface-container-highest text-on-surface-variant'
    return (
      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cls}`}>
        {getEventStatusLabel(status)}
      </span>
    )
  }

  return (
    <PageWrapper>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'My Events',     value: events.length,  sub: 'Assigned events', icon: <CalendarCheck size={20} />, bg: 'bg-secondary/10',    color: 'text-secondary'    },
          { label: 'Pending Tasks', value: pendingTasks,   sub: 'To complete',      icon: <Clock size={20} />,         bg: 'bg-amber-100',       color: 'text-amber-700'    },
          { label: 'Done Tasks',    value: completedTasks, sub: 'Completed',         icon: <CheckCircle2 size={20} />,  bg: 'bg-green-100',       color: 'text-green-700'    },
        ].map(({ label, value, sub, icon, bg, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 sm:p-5 shadow-sm">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold leading-tight truncate">{label}</p>
                <p className="text-xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2">{value}</p>
              </div>
              <div className={`shrink-0 p-1.5 sm:p-2.5 rounded-lg ${bg} ${color}`}>{icon}</div>
            </div>
            <p className="mt-2 text-[10px] sm:text-xs text-on-surface-variant hidden sm:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── My Events ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary">My Events</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5 hidden sm:block">
              Events where you are added as a participant.
            </p>
          </div>
          <Link to="/student/events" className="text-secondary font-semibold hover:underline text-xs sm:text-sm">
            View all →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-center text-on-surface-variant text-sm">
            You don't have any assigned events yet.
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map(event => (
              <div
                key={event._id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-3 cursor-pointer hover:bg-surface-container-low active:bg-surface-container transition-colors"
                onClick={() => navigate(`/student/events/${event._id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-primary text-sm leading-snug min-w-0 truncate">{event.title}</p>
                  {statusBadge(event.status)}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{formatDate(event.startDate)}{event.endDate && event.endDate !== event.startDate ? ` - ${formatDate(event.endDate)}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── My Tasks ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary">My Tasks</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5 hidden sm:block">
              Tasks assigned to you for current events.
            </p>
          </div>
          <Link to="/student/tasks" className="text-secondary font-semibold hover:underline text-xs sm:text-sm">
            View all →
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-center text-on-surface-variant text-sm">
            No tasks assigned yet.
          </div>
        ) : (
          <div className="space-y-2">
            {myTasks.slice(0, 4).map(task => (
              <div
                key={task._id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm leading-snug min-w-0 truncate ${
                    task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      task.priority === 'High'   ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                   'bg-green-100 text-green-700'
                    }`}>{task.priority}</span>
                    {task.isDone
                      ? <CheckCircle2 size={14} className="text-green-600" />
                      : <Clock size={14} className="text-amber-500" />
                    }
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{task.event?.title || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </PageWrapper>
  )
}
