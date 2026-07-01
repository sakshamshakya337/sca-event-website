import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { CalendarCheck, CheckSquare } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useTaskStore from '../../store/taskStore'
import { normalizeEventStatus, getEventStatusLabel } from '../../utils/eventUtils'

export default function LayoutDashboard() {
  const navigate = useNavigate()
  const { events, fetchEvents } = useEventStore()
  const { myTasks, getMyTasks } = useTaskStore()

  useEffect(() => {
    fetchEvents()
    getMyTasks()
  }, [fetchEvents, getMyTasks])

  const pendingTasks = myTasks.filter((task) => !task.isDone).length
  const completedTasks = myTasks.filter((task) => task.isDone).length

  return (
    <PageWrapper>
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'My Events',
            value: events.length,
            sub: 'Events assigned to you by faculty or admin.',
            icon: <CalendarCheck className="w-6 h-6" />,
            iconCls: 'text-secondary bg-secondary-fixed',
          },
          {
            label: 'Tasks Pending',
            value: pendingTasks,
            sub: 'Tasks assigned directly to you.',
            icon: <CheckSquare className="w-6 h-6" />,
            iconCls: 'text-amber-700 bg-amber-100',
          },
          {
            label: 'Tasks Completed',
            value: completedTasks,
            sub: 'Tasks you have completed.',
            icon: <CheckSquare className="w-6 h-6" />,
            iconCls: 'text-green-700 bg-green-100',
          },
        ].map(({ label, value, sub, icon, iconCls }) => (
          <div
            key={label}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col justify-between shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant font-semibold">{label}</p>
                <h2 className="text-3xl mt-3 text-primary font-bold">{value}</h2>
              </div>
              <div className={`p-3 rounded-xl ${iconCls}`}>{icon}</div>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── My Events ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-primary">My Events</h3>
            <p className="text-on-surface-variant text-sm mt-1">Events where you are added as a participant.</p>
          </div>
          <Link to="/student/events" className="text-secondary font-semibold hover:underline text-sm self-start sm:self-auto">
            View all
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant text-sm">
            You don't have any assigned events yet.
          </div>
        ) : (
          <>
            {/* Mobile: card view */}
            <div className="sm:hidden space-y-3">
              {events.slice(0, 3).map(event => (
                <div
                  key={event._id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 cursor-pointer"
                  onClick={() => navigate(`/student/events/${event._id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-primary text-sm">{event.title}</p>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-800' :
                      normalizeEventStatus(event.status) === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {getEventStatusLabel(event.status)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{event.date}</p>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Event Name</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Date</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Status</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {events.slice(0, 3).map(event => (
                      <tr
                        key={event._id}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => navigate(`/student/events/${event._id}`)}
                      >
                        <td className="px-6 py-4 font-semibold text-primary text-sm">{event.title}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{event.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                            normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-800' :
                            normalizeEventStatus(event.status) === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {getEventStatusLabel(event.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary font-semibold text-sm">View</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── My Tasks ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-primary">My Tasks</h3>
            <p className="text-on-surface-variant text-sm mt-1">Tasks assigned to you for current events.</p>
          </div>
          <Link to="/student/tasks" className="text-secondary font-semibold hover:underline text-sm self-start sm:self-auto">
            View all
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center text-on-surface-variant text-sm">
            No assigned tasks yet. Faculty will assign tasks after adding you to an event.
          </div>
        ) : (
          <>
            {/* Mobile: card view */}
            <div className="sm:hidden space-y-3">
              {myTasks.slice(0, 4).map(task => (
                <div key={task._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                      {task.title}
                    </p>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>{task.priority}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{task.event?.title || 'N/A'}</p>
                  <p className="text-xs mt-1 font-medium">{task.isDone ? '✓ Completed' : 'Pending'}</p>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Task</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Event</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Priority</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {myTasks.slice(0, 4).map(task => (
                      <tr key={task._id} className="hover:bg-surface-container-low transition-colors">
                        <td className={`px-6 py-4 font-semibold text-sm ${task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                          {task.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{task.event?.title || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>{task.priority}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">{task.isDone ? 'Completed' : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </PageWrapper>
  )
}
