import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdSearch, MdCheck, MdEdit, MdDelete } from 'react-icons/md'
import useTaskStore from '../../store/taskStore'

export default function MyTasks() {
  const { myTasks, getMyTasks, completeTask } = useTaskStore()
  const [activeFilter, setActiveFilter] = useState('All')

  // Fetch tasks on mount
  useEffect(() => {
    getMyTasks()
  }, [getMyTasks])

  const filteredTasks = myTasks.filter(task => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Pending') return !task.isDone
    if (activeFilter === 'Completed') return task.isDone
    return true
  })

  const priorityStyles = {
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700'
  }

  return (
    <PageWrapper>
      {/* Filters */}
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
              {filter} <span className="ml-1 opacity-60">{filter === 'All' ? myTasks.length : filter === 'Pending' ? myTasks.filter(t => !t.isDone).length : myTasks.filter(t => t.isDone).length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-1.5 w-64 text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 w-12"></th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Task Detail</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Event</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Priority</th>
              <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredTasks.map(task => (
              <tr key={task._id} className={`hover:bg-surface-bright transition-colors group ${task.isDone ? 'bg-surface-container-lowest' : ''}`}>
                <td className="px-6 py-4">
                  <div
                    onClick={() => completeTask(task._id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                      task.isDone
                        ? 'bg-secondary text-white'
                        : 'border-2 border-outline-variant hover:border-secondary'
                    }`}
                  >
                    {task.isDone && <MdCheck className="w-4 h-4 font-bold" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className={`font-semibold text-body-md ${task.isDone ? 'line-through text-slate-400' : 'text-primary'}`}>
                    {task.title}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-body-sm bg-surface-container px-2 py-1 rounded ${task.isDone ? 'text-on-surface-variant/70' : ''}`}>
                    {typeof task.event === 'object' ? task.event?.title : task.event || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wide ${priorityStyles[task.priority]} ${task.isDone ? 'text-on-surface-variant/70 bg-surface-container-highest' : ''}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-body-sm text-on-surface-variant ${task.isDone ? 'text-on-surface-variant/70' : ''}`}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
