import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { Search, Check, CheckCircle2, Clock, CalendarDays } from 'lucide-react'
import useTaskStore from '../../store/taskStore'

const priorityStyles = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
}

export default function MyTasks() {
  const { myTasks, getMyTasks, completeTask, isLoading } = useTaskStore()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { getMyTasks() }, [getMyTasks])

  const filtered = myTasks.filter(task => {
    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Pending' && !task.isDone) ||
      (activeFilter === 'Completed' && task.isDone)
    const matchSearch = !search.trim() ||
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.event?.title?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    All: myTasks.length,
    Pending: myTasks.filter(t => !t.isDone).length,
    Completed: myTasks.filter(t => t.isDone).length,
  }

  return (
    <PageWrapper>
      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-surface-container p-1 rounded-xl">
          {['All', 'Pending', 'Completed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeFilter === filter
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {filter}
              <span className="ml-1 opacity-60 text-xs">{counts[filter]}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-56 bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
          />
        </div>
      </div>

      {/* Empty states */}
      {isLoading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center text-on-surface-variant text-sm">
          Loading tasks…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
          <p className="text-lg font-semibold text-primary mb-2">No tasks yet</p>
          <p className="text-on-surface-variant text-sm">Tasks assigned to you will appear here once your admin creates them.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card view */}
          <div className="sm:hidden space-y-3">
            {filtered.map(task => (
              <div
                key={task._id}
                className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-4 ${task.isDone ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => !task.isDone && completeTask(task._id)}
                    disabled={task.isDone}
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      task.isDone
                        ? 'bg-secondary text-white cursor-default'
                        : 'border-2 border-outline-variant hover:border-secondary'
                    }`}
                  >
                    {task.isDone && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${task.isDone ? 'line-through text-slate-400' : 'text-primary'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{task.event?.title || 'N/A'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityStyles[task.priority] || 'bg-surface-container text-on-surface-variant'}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <CalendarDays size={11} />
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </span>
                      )}
                      {task.isDone
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle2 size={11} /> Done</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold"><Clock size={11} /> Pending</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Task Detail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map(task => (
                  <tr key={task._id} className={`hover:bg-surface-container-low transition-colors ${task.isDone ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => !task.isDone && completeTask(task._id)}
                        disabled={task.isDone}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          task.isDone
                            ? 'bg-secondary text-white cursor-default'
                            : 'border-2 border-outline-variant hover:border-secondary'
                        }`}
                      >
                        {task.isDone && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold text-sm ${task.isDone ? 'line-through text-slate-400' : 'text-primary'}`}>
                        {task.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                        {typeof task.event === 'object' ? task.event?.title : task.event || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${priorityStyles[task.priority] || 'bg-surface-container text-on-surface-variant'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {task.isDone
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle2 size={11} /> Done</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full"><Clock size={11} /> Pending</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageWrapper>
  )
}
