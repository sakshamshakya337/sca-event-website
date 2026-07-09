import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { Check, CheckCircle2, Clock, CalendarDays, Search } from 'lucide-react'
import useTaskStore from '../../store/taskStore'

const priCls = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
}

function fmt(d) {
  if (!d) return 'N/A'
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function MyTasks() {
  const { myTasks, getMyTasks, completeTask, isLoading } = useTaskStore()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { getMyTasks() }, [getMyTasks])

  const counts = {
    All: myTasks.length,
    Pending:   myTasks.filter(t => !t.isDone).length,
    Completed: myTasks.filter(t =>  t.isDone).length,
  }

  const items = myTasks.filter(t => {
    const mf = filter === 'All' ? true : filter === 'Pending' ? !t.isDone : t.isDone
    const ms = !search.trim() ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.event?.title?.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  return (
    <PageWrapper>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex bg-surface-container p-1 rounded-xl gap-0.5">
          {['All', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {f} <span className="opacity-50">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full sm:w-52 pl-9 pr-3 py-1.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-10 text-center text-sm text-on-surface-variant">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-10 text-center">
          <p className="font-semibold text-primary mb-1">No tasks</p>
          <p className="text-sm text-on-surface-variant">Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(task => (
            <div
              key={task._id}
              className={`bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-3 flex items-start gap-3 ${task.isDone ? 'opacity-60' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => !task.isDone && completeTask(task._id)}
                disabled={task.isDone}
                className={`mt-0.5 w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors ${
                  task.isDone
                    ? 'bg-secondary text-white cursor-default'
                    : 'border-2 border-outline-variant hover:border-secondary'
                }`}
              >
                {task.isDone && <Check size={14} />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm leading-snug ${task.isDone ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${priCls[task.priority] || 'bg-surface-container text-on-surface-variant'}`}>
                      {task.priority}
                    </span>
                    {task.isDone
                      ? <CheckCircle2 size={14} className="text-green-600" />
                      : <Clock size={14} className="text-amber-500" />
                    }
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-xs text-on-surface-variant">{task.event?.title || '—'}</span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <CalendarDays size={10} /> {fmt(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
