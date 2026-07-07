import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import {
  ChevronLeft, CalendarDays, MapPin, Clock, Star,
  CheckCircle2, ClipboardList
} from 'lucide-react'
import useEventStore from '../../store/eventStore'
import useTodoStore from '../../store/todoStore'
import useTaskStore from '../../store/taskStore'
import useAuthStore from '../../store/authStore'
import { normalizeEventStatus, getEventStatusLabel } from '../../utils/eventUtils'

export default function StudentEventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchEventById } = useEventStore()
  const { todos, getEventTodos, completeTodo } = useTodoStore()
  const { tasks, getEventTasks, completeTask } = useTaskStore()

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      const result = await fetchEventById(id)
      setEvent(result)
      if (result) {
        await Promise.all([getEventTodos(id), getEventTasks(id)])
      }
      setLoading(false)
    }
    load()
  }, [id, fetchEventById, getEventTodos, getEventTasks])

  // Todos relevant to students
  const myTodos = todos.filter(t => t.audience === 'all' || t.audience === 'students')

  // Tasks assigned specifically to this student
  const myTasks = tasks.filter(t => {
    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo
    return String(assignedId) === String(user?._id)
  })

  const totalItems = myTodos.length + myTasks.length
  const doneItems = myTasks.filter(t => t.isDone).length

  const statusConfig = {
    approved:  { cls: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
    pending:   { cls: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
    rejected:  { cls: 'bg-red-100 text-red-700 border-red-200',        dot: 'bg-red-500'   },
    completed: { cls: 'bg-gray-100 text-gray-600 border-gray-200',     dot: 'bg-gray-400'  },
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-[900px] mx-auto text-center py-20 text-on-surface-variant">
          Loading event details…
        </div>
      </PageWrapper>
    )
  }

  if (!event) {
    return (
      <PageWrapper>
        <div className="max-w-[900px] mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant mb-6">
            <ChevronLeft size={20} /> Back
          </button>
          <div className="bg-white border border-outline-variant rounded-xl p-16 text-center">
            <p className="text-on-surface-variant">Event not found or you are not assigned to this event.</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const status = normalizeEventStatus(event.status)
  const cfg = statusConfig[status] || statusConfig.pending

  return (
    <PageWrapper>
      <div className="max-w-[900px] mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium"
        >
          <ChevronLeft size={20} /> Back to Events
        </button>

        {/* Event Info Card */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className="w-full h-52 object-cover" />
          )}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
                  {event.title?.[0]}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-on-surface">{event.title}</h1>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-outline" />
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-outline" />
                        {event.time}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-outline" />
                      {event.venue || '—'}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">{event.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {event.isImportant && <Star size={16} className="text-amber-500" fill="currentColor" />}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${cfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {getEventStatusLabel(event.status)}
                </span>
                {event.type && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-container text-on-surface-variant border border-outline-variant">
                    {event.type}
                  </span>
                )}
              </div>
            </div>

            {/* Summary chips */}
            <div className="mt-5 pt-5 border-t border-outline-variant flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                <ClipboardList size={13} />
                {totalItems} Checklist item{totalItems !== 1 ? 's' : ''}
              </div>
              {myTasks.length > 0 && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <CheckCircle2 size={13} />
                  {doneItems}/{myTasks.length} Tasks done
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Checklist — todos + assigned tasks unified */}
        <div className="bg-white border border-outline-variant rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-on-surface text-base mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" />
            My Checklist
            {totalItems > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                {totalItems}
              </span>
            )}
          </h3>

          {totalItems === 0 ? (
            <p className="text-center py-10 text-on-surface-variant text-sm">
              No checklist items yet. Your faculty will add tasks and todos here.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Manual todos from faculty/admin */}
              {myTodos.map(todo => {
                const done = todo.completedBy?.some(u =>
                  String(typeof u === 'object' ? u._id : u) === String(user?._id)
                )
                return (
                  <div
                    key={`todo-${todo._id}`}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      done ? 'bg-green-50 border-green-200' : 'bg-surface-container border-outline-variant'
                    }`}
                  >
                    <button
                      onClick={() => !done && completeTodo(todo._id)}
                      disabled={done}
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                        done
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'text-outline-variant hover:bg-surface-container-high hover:text-primary'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                          {todo.title}
                        </p>
                        {todo.isImportant && <Star size={12} className="text-amber-500" fill="currentColor" />}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        By {todo.createdBy?.firstName} {todo.createdBy?.lastName}
                      </p>
                      {done && <p className="text-xs text-green-600 font-semibold mt-1">✓ Completed</p>}
                    </div>
                  </div>
                )
              })}

              {/* Assigned tasks as checklist items */}
              {myTasks.map(task => (
                <div
                  key={`task-${task._id}`}
                  className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-colors ${
                    task.isDone ? 'bg-green-50 border-green-200' : 'bg-surface-container border-outline-variant'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => !task.isDone && completeTask(task._id)}
                      disabled={task.isDone}
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                        task.isDone
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'text-outline-variant hover:bg-surface-container-high hover:text-primary'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${task.isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <CalendarDays size={11} />
                            Due {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {task.notes && <span className="text-xs text-on-surface-variant italic">{task.notes}</span>}
                      </div>
                    </div>
                  </div>
                  {task.isDone && (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0 self-center">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}
