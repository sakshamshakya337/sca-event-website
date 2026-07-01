import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { CalendarCheck, CheckSquare, Star, GraduationCap, Terminal, Plus } from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useTaskStore from '../../store/taskStore'

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant font-semibold">My Events</p>
              <h2 className="text-3xl mt-3 text-primary font-bold">{events.length}</h2>
            </div>
            <div className="text-secondary p-3 bg-secondary-fixed rounded-xl">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 text-sm text-on-surface-variant">Events assigned to you by faculty or admin.</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant font-semibold">Tasks Pending</p>
              <h2 className="text-3xl mt-3 text-primary font-bold">{pendingTasks}</h2>
            </div>
            <div className="text-amber-700 p-3 bg-amber-100 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 text-sm text-on-surface-variant">Tasks assigned directly to you.</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant font-semibold">Tasks Completed</p>
              <h2 className="text-3xl mt-3 text-primary font-bold">{completedTasks}</h2>
            </div>
            <div className="text-green-700 p-3 bg-green-100 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 text-sm text-on-surface-variant">Tasks you have completed.</div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h3 className="text-headline-lg font-semibold text-primary">My Events</h3>
            <p className="text-on-surface-variant mt-2">Events where you are added as a participant.</p>
          </div>
          <Link to="/student/events" className="text-secondary font-semibold hover:underline">View all</Link>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
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
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">You don't have any assigned events yet.</td>
                  </tr>
                ) : (
                  events.slice(0, 3).map((event) => (
                    <tr key={event._id} className="hover:bg-surface-bright transition-colors cursor-pointer" onClick={() => navigate(`/student/events/${event._id}`)}>
                      <td className="px-6 py-4 font-semibold text-primary">{event.title}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{event.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${event.status === 'approved' ? 'bg-green-100 text-green-800' : event.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary font-semibold">View</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h3 className="text-headline-lg font-semibold text-primary">My Tasks</h3>
            <p className="text-on-surface-variant mt-2">Tasks assigned to you for current events.</p>
          </div>
          <button className="rounded-2xl border border-outline-variant px-4 py-2 text-on-surface-variant bg-surface-container-lowest" disabled>Search tasks</button>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
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
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant">No assigned tasks yet. Faculty will assign tasks after adding you to an event.</td>
                  </tr>
                ) : (
                  myTasks.slice(0, 4).map((task) => (
                    <tr key={task._id} className="hover:bg-surface-bright transition-colors">
                      <td className={`px-6 py-4 font-semibold ${task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                        {task.title}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{task.event?.title || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">{task.isDone ? 'Completed' : 'Pending'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
