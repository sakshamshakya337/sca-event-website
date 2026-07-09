import { useState, useEffect } from 'react'
import { Search, Check, CheckCircle2, Clock, CalendarDays } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import useTaskStore from '../../store/taskStore'

export default function MyTasks() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const { myTasks, getMyTasks, completeTask, isLoading } = useTaskStore()

  useEffect(() => {
    getMyTasks()
  }, [getMyTasks])

  const filtered = myTasks.filter(task => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Pending' && !task.isDone) ||
      (activeFilter === 'Completed' && task.isDone)
    const matchesSearch =
      !search.trim() ||
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.event?.title?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const counts = {
    All: myTasks.length,
    Pending: myTasks.filter(t => !t.isDone).length,
    Completed: myTasks.filter(t => t.isDone).length,
  }

  const priorityStyles = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-green-100 text-green-700',
  }

  return (
    <PageWrapper>
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex bg-surface-container p-1 rounded-xl w-full md:w-auto">
          {['All', 'Pending', 'Completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-body-md font-semibold transition-colors ${
                activeFilter === filter
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {filter}
              <span className="ml-1 opacity-60">{counts[filter]}</span>
            </button>
          ))}
        </div>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-1.5 w-64 text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
          />
        </div>
      </div>

      {/* Tasks list */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-on-surface-variant">Loading tasks…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <p className="text-xl font-semibold text-primary mb-3">No tasks yet</p>
            <p className="max-w-xl mx-auto">
              Tasks assigned to you will appear here once your admin creates them.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider">Task</th>
                <th className="px-6 py-4 text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map(task => (
                <tr
                  key={task._id}
                  className={`hover:bg-surface-container-low transition-colors ${task.isDone ? 'opacity-60' : ''}`}
                >
                  {/* Complete toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => !task.isDone && completeTask(task._id)}
                      disabled={task.isDone}
                      title={task.isDone ? 'Completed' : 'Mark as done'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        task.isDone
                          ? 'bg-secondary text-white cursor-default'
                          : 'border-2 border-outline-variant hover:border-secondary'
                      }`}
                    >
                      {task.isDone && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <p className={`font-semibold text-body-md ${task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-on-surface-variant mt-0.5 italic">{task.notes}</p>
                    )}
                  </td>

                  {/* Event */}
                  <td className="px-6 py-4">
                    <span className="text-body-sm bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                      {task.event?.title || '—'}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wide ${priorityStyles[task.priority] || 'bg-surface-container text-on-surface-variant'}`}>
                      {task.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {task.priority || '—'}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                      {task.dueDate ? (
                        <>
                          <CalendarDays size={13} className="text-outline" />
                          {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </>
                      ) : '—'}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    {task.isDone ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  )
}
