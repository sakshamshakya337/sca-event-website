import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, Check } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'

export default function MyTasks() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [tasks, setTasks] = useState([])

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const priorityStyles = {
    'High': 'bg-error-container text-error',
    'Medium': 'bg-surface-container-highest text-on-surface-variant',
    'Low': 'bg-surface-container-highest text-on-surface-variant'
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
              {filter} <span className="ml-1 opacity-60">{filter === 'All' ? tasks.length : filter === 'Pending' ? tasks.filter(t => !t.completed).length : tasks.filter(t => t.completed).length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
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
        {tasks.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <p className="text-xl font-semibold text-primary mb-3">No tasks yet</p>
            <p className="max-w-xl mx-auto">Tasks assigned to you will appear here once your faculty or admin team creates them.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 font-headline-sm text-on-surface-variant">ClipboardList Detail</th>
                <th className="px-6 py-4 font-headline-sm text-on-surface-variant">CalendarDays</th>
                <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Priority</th>
                <th className="px-6 py-4 font-headline-sm text-on-surface-variant">Due Date</th>
                <th className="px-6 py-4 font-headline-sm text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {tasks.map(task => (
                <tr key={task.id} className={`hover:bg-surface-container-low transition-colors group ${task.completed ? 'bg-surface-container-lowest' : ''}`}>
                  <td className="px-6 py-4">
                    <div
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                        task.completed
                          ? 'bg-secondary text-white'
                          : 'border-2 border-outline-variant hover:border-secondary'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 font-bold" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-semibold text-body-md ${task.completed ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                      {task.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-body-sm bg-surface-container px-2 py-1 rounded ${task.completed ? 'text-on-surface-variant/70' : ''}`}>
                      {task.event}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wide ${priorityStyles[task.priority]} ${task.completed ? 'text-on-surface-variant/70 bg-surface-container-highest' : ''}`}>
                      {task.priority === 'High' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      )}
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-code-sm text-code-sm text-on-surface-variant ${task.completed ? 'text-on-surface-variant/70' : ''}`}>
                      {task.dueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`flex justify-end gap-2 text-on-surface-variant transition-opacity ${task.completed ? 'text-on-surface-variant/50' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button className="p-1.5 hover:bg-surface-container-high rounded-lg">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:bg-error-container hover:text-error rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Plus ClipboardList Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-secondary text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Plus ClipboardList
        </button>
      </div>
    </PageWrapper>
  )
}
