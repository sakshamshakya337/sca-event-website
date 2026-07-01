import React, { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { Search, Check, Edit, Trash2, Plus } from 'lucide-react'
import useAdminTaskStore from '../../store/adminTaskStore'

export default function MyTasks() {
  const [activeFilter, setActiveFilter] = useState('All')
  const { tasks, addTask, toggleTask, editTask, deleteTask } = useAdminTaskStore()

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Pending') return !task.completed
    if (activeFilter === 'Completed') return task.completed
    return true
  })

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-primary">My Tasks</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Manage your admin tasks for the university.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-surface-container p-1 rounded-xl w-full md:w-fit">
            {['All', 'Pending', 'Completed'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-body-md font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {filter} <span className="ml-1 opacity-60">
                  {filter === 'All' ? tasks.length :
                   filter === 'Pending' ? tasks.filter(t => !t.completed).length :
                   tasks.filter(t => t.completed).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-1.5 w-64 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4 text-headline-sm font-headline-sm text-on-surface-variant">Task Detail</th>
                  <th className="px-6 py-4 text-headline-sm font-headline-sm text-on-surface-variant">Category</th>
                  <th className="px-6 py-4 text-headline-sm font-headline-sm text-on-surface-variant">Priority</th>
                  <th className="px-6 py-4 text-headline-sm font-headline-sm text-on-surface-variant">Due Date</th>
                  <th className="px-6 py-4 text-headline-sm font-headline-sm text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredTasks.map(task => (
                  <tr key={task.id} className={`hover:bg-surface-container-low transition-colors ${task.completed ? 'bg-surface-container-lowest' : ''}`}>
                    <td className="px-6 py-4">
                      <div
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-secondary text-white'
                            : 'border-2 border-outline-variant hover:border-secondary'
                        }`}
                      >
                        {task.completed && <Check size={16} className="font-bold" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-body-md font-semibold ${task.completed ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                        {task.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-body-sm bg-surface-container px-2 py-1 rounded ${task.completed ? 'text-on-surface-variant/70' : ''}`}>
                        {task.event}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wide ${
                        task.priority === 'High' ? 'bg-error-container text-error' : 'bg-surface-container-highest text-on-surface-variant'
                      } ${task.completed ? 'text-on-surface-variant/70 bg-surface-container-highest' : ''}`}>
                        {task.priority === 'High' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
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
                      <div className={`flex justify-end gap-2 text-on-surface-variant transition-opacity ${task.completed ? 'text-on-surface-variant/50' : 'opacity-0 hover:opacity-100'}`}>
                        <button className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors">
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 hover:bg-error-container hover:text-error rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fixed bottom-6 right-6">
          <button className="bg-secondary text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-secondary/90 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
