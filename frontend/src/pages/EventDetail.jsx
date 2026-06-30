import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import {
  MdChevronLeft,
  MdAdd,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdStar,
  MdCalendarMonth,
  MdPlace,
  MdAccessTime,
  MdPerson,
} from 'react-icons/md'
import useEventStore from '../store/eventStore'
import useTodoStore from '../store/todoStore'
import useTaskStore from '../store/taskStore'
import useAuthStore from '../store/authStore'
import api from '../config/axios'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { events, selectedEvent, fetchEventById } = useEventStore()
  const { todos, getEventTodos, createTodo, completeTodo, deleteTodo } = useTodoStore()
  const { tasks, getEventTasks, createTask, completeTask, deleteTask } = useTaskStore()
  const [activeTab, setActiveTab] = useState('todos')
  const [eventLoading, setEventLoading] = useState(false)
  
  // States for add todo form
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')
  const [todoAudience, setTodoAudience] = useState('all')
  const [todoIsImportant, setTodoIsImportant] = useState(false)
  
  // States for add task form
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignedTo, setTaskAssignedTo] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskNotes, setTaskNotes] = useState('')
  
  // Get students for assign dropdown
  const [students, setStudents] = useState([])

  const taskEvent = todos[0]?.event || tasks[0]?.event
  const event = selectedEvent || events.find(e => e._id === id) || taskEvent

  useEffect(() => {
    if (!id) return

    const loadEvent = async () => {
      setEventLoading(true)
      try {
        await fetchEventById(id)
      } catch (err) {
        toast.error('Unable to load event details')
      } finally {
        setEventLoading(false)
      }
    }

    getEventTodos(id)
    getEventTasks(id)
    loadEvent()

    const fetchStudents = async () => {
      try {
        const res = await api.get('/users/students')
        setStudents(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch students:', err)
      }
    }
    fetchStudents()
  }, [id, fetchEventById, getEventTasks, getEventTodos])

  const handleAddTodo = async (e) => {
    e.preventDefault()
    try {
      await createTodo({
        event: id,
        title: todoTitle,
        audience: todoAudience,
        isImportant: todoIsImportant
      })
      setTodoTitle('')
      setTodoAudience('all')
      setTodoIsImportant(false)
      setShowTodoForm(false)
      toast.success('Todo added successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add todo')
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      await createTask({
        event: id,
        title: taskTitle,
        assignedTo: taskAssignedTo,
        priority: taskPriority,
        dueDate: taskDueDate,
        notes: taskNotes
      })
      setTaskTitle('')
      setTaskAssignedTo('')
      setTaskPriority('Medium')
      setTaskDueDate('')
      setTaskNotes('')
      setShowTaskForm(false)
      toast.success('Task assigned successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign task')
    }
  }

  const canManage = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'superadmin'

  if (eventLoading) {
    return (
      <PageWrapper>
        <div className="max-w-[1400px] mx-auto text-center py-16 text-on-surface-variant">
          Loading event details…
        </div>
      </PageWrapper>
    )
  }

  if (!event) {
    return (
      <PageWrapper>
        <div className="max-w-[1400px] mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant mb-6">
            <MdChevronLeft size={20} />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-body-md text-on-surface-variant">Event not found</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface"
          >
            <MdChevronLeft size={24} />
            Back
          </button>
        </div>

        {/* Event Info */}
        <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
          {canManage && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate(user?.role === 'admin' || user?.role === 'superadmin' ? `/admin/events/${id}/edit` : `/faculty/events/${id}/edit`)}
                className="px-4 py-2 rounded-lg bg-secondary text-white text-body-sm font-semibold hover:bg-secondary/90 transition-colors"
              >
                Edit Event
              </button>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-container text-primary rounded-xl flex items-center justify-center text-2xl font-bold">
                {event.title[0]}
              </div>
              <div>
                <h1 className="text-headline-lg text-on-surface font-bold">{event.title}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-body-md text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <MdCalendarMonth size={18} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MdAccessTime size={18} />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MdPlace size={18} />
                    {event.venue}
                  </span>
                </div>
                <p className="mt-3 text-body-md text-on-surface-variant">{event.description}</p>
              </div>
            </div>
            {event.isImportant && (
              <MdStar className="text-yellow-500" size={24} />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant">
          <button 
            onClick={() => setActiveTab('todos')}
            className={`px-6 py-3 text-body-md font-medium border-b-2 transition-colors ${
              activeTab === 'todos' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todo List
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 text-body-md font-medium border-b-2 transition-colors ${
              activeTab === 'tasks' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Assigned Tasks
          </button>
        </div>

        {/* Todo List Section */}
        {activeTab === 'todos' && (
          <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-headline-md text-on-surface font-semibold">Event Todos</h3>
              {canManage && (
                <button
                  onClick={() => setShowTodoForm(!showTodoForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-body-md font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                >
                  <MdAdd size={18} />
                  Add Todo
                </button>
              )}
            </div>

            {/* Add Todo Form */}
            {showTodoForm && (
              <form onSubmit={handleAddTodo} className="mb-6 bg-surface-container rounded-lg p-4 border border-outline-variant">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Todo Title</label>
                    <input 
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={todoTitle}
                      onChange={(e) => setTodoTitle(e.target.value)}
                      placeholder="Enter todo title"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Audience</label>
                      <select 
                        className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                        value={todoAudience}
                        onChange={(e) => setTodoAudience(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="students">Students</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="isImportant"
                        checked={todoIsImportant}
                        onChange={(e) => setTodoIsImportant(e.target.checked)}
                        className="w-4 h-4 text-secondary focus:ring-secondary border-outline-variant rounded"
                      />
                      <label htmlFor="isImportant" className="text-sm text-on-surface-variant">Mark as important</label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowTodoForm(false)}
                      className="px-4 py-2 text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Add Todo
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Todos */}
            <div className="space-y-3">
              {todos.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-8">No todos yet</p>
              ) : (
                todos.map(todo => {
                  const isCompleted = todo.completedBy?.includes(user?._id)
                  return (
                    <div 
                      key={todo._id} 
                      className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => completeTodo(todo._id)}
                          className={`p-2 rounded-lg ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700' 
                              : 'text-outline hover:bg-surface-container-high'
                          }`}
                        >
                          <MdCheckCircle size={20} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium text-body-md ${isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                              {todo.title}
                            </h4>
                            {todo.isImportant && <MdStar className="text-yellow-500" size={16} />}
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Audience: {todo.audience} | Added by: {todo.createdBy?.firstName} {todo.createdBy?.lastName}
                          </p>
                          {todo.completedBy?.length > 0 && (
                            <p className="text-xs text-on-surface-variant mt-1">
                              Completed by: {todo.completedBy.map((student, idx) => (
                                <span key={student._id}>
                                  {student.firstName} {student.lastName} ({student.registrationNumber || student.officialEmail || 'N/A'}){idx < todo.completedBy.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => deleteTodo(todo._id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg"
                        >
                          <MdDelete size={20} />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {activeTab === 'tasks' && (
          <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-headline-md text-on-surface font-semibold">Assigned Tasks</h3>
              {canManage && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-body-md font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                >
                  <MdAdd size={18} />
                  Assign Task
                </button>
              )}
            </div>

            {/* Add Task Form */}
            {showTaskForm && (
              <form onSubmit={handleAddTask} className="mb-6 bg-surface-container rounded-lg p-4 border border-outline-variant">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Task Title</label>
                    <input 
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Assign to</label>
                      <select 
                        className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                        value={taskAssignedTo}
                        onChange={(e) => setTaskAssignedTo(e.target.value)}
                        required
                      >
                        <option value="">Select student</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.firstName} {student.lastName} ({student.registrationNumber || student.officialEmail})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Priority</label>
                      <select 
                        className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Due Date</label>
                    <input 
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Notes</label>
                    <textarea 
                      className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      placeholder="Add any notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="px-4 py-2 text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tasks */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-8">No tasks assigned yet</p>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task._id} 
                    className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => completeTask(task._id)}
                        disabled={task.isDone}
                        className={`p-2 rounded-lg ${
                          task.isDone 
                            ? 'bg-green-100 text-green-700' 
                            : 'text-outline hover:bg-surface-container-high'
                        }`}
                      >
                        <MdCheckCircle size={20} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium text-body-md ${task.isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                            {task.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <MdPerson size={14} />
                            Assigned by: {task.createdBy?.firstName} {task.createdBy?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdPerson size={14} />
                            Assigned to: {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <MdCalendarMonth size={14} />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {task.notes && (
                          <p className="mt-2 text-xs text-on-surface-variant">{task.notes}</p>
                        )}
                      </div>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg"
                      >
                        <MdDelete size={20} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
