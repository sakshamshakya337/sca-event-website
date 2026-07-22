import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import {
  ChevronLeft, Plus, CheckCircle2, Trash2, Star,
  CalendarDays, MapPin, Clock, User, GraduationCap,
  UserPlus, X, Users, Search,
} from 'lucide-react'
import useEventStore from '../store/eventStore'
import useTodoStore from '../store/todoStore'
import useTaskStore from '../store/taskStore'
import useAuthStore from '../store/authStore'
import api from '../config/axios'
import toast from 'react-hot-toast'
import { normalizeEventStatus } from '../utils/eventUtils'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { events, selectedEvent, fetchEventById, completeEvent } = useEventStore()
  const { todos, getEventTodos, createTodo, completeTodo, deleteTodo } = useTodoStore()
  const { tasks, getEventTasks, createTask, completeTask, deleteTask } = useTaskStore()

  const [activeTab, setActiveTab] = useState('todos')
  const [eventLoading, setEventLoading] = useState(false)

  // Todo form state
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')
  const [todoAudience, setTodoAudience] = useState('all')
  const [todoIsImportant, setTodoIsImportant] = useState(false)

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignedTo, setTaskAssignedTo] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskNotes, setTaskNotes] = useState('')

  // People lists
  const [students, setStudents] = useState([])
  const [allFaculty, setAllFaculty] = useState([])
  const [loadingPeople, setLoadingPeople] = useState(false)

  // Faculty search state (assign faculty tab)
  const [facultySearchQuery, setFacultySearchQuery] = useState('')
  const [facultySearchResults, setFacultySearchResults] = useState([])
  const [searchingFaculty, setSearchingFaculty] = useState(false)

  // Student search state (shared: task assign form + assign students tab)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [studentSearchResults, setStudentSearchResults] = useState([])
  const [searchingStudents, setSearchingStudents] = useState(false)

  // Student assign tab state (admin + faculty)
  const [studentTabSearchQuery, setStudentTabSearchQuery] = useState('')
  const [studentTabSearchResults, setStudentTabSearchResults] = useState([])
  const [searchingStudentTab, setSearchingStudentTab] = useState(false)
  const [assigningStudentId, setAssigningStudentId] = useState(null)
  const [removingStudentId, setRemovingStudentId] = useState(null)

  // Faculty assign state (admin only)
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [assigningFaculty, setAssigningFaculty] = useState(false)
  const [removingFacultyId, setRemovingFacultyId] = useState(null)

  const event = selectedEvent || events.find(e => e._id === id)
  const canManage = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    if (!id) return
    const loadEvent = async () => {
      setEventLoading(true)
      try { await fetchEventById(id) }
      catch { toast.error('Unable to load event details') }
      finally { setEventLoading(false) }
    }
    getEventTodos(id)
    getEventTasks(id)
    loadEvent()

    // Only fetch people lists for faculty/admin — students don't need them
    if (canManage) {
      setLoadingPeople(true)
      Promise.all([
        api.get('/users/students').then(r => {
          const list = r.data.data || []
          setStudents(list)
          setStudentTabSearchResults(list)
        }).catch(() => {}),
        api.get('/users/faculty').then(r => {
          const list = r.data.data || []
          setAllFaculty(list)
          setFacultySearchResults(list)
        }).catch(() => {})
      ]).finally(() => setLoadingPeople(false))
    }
  }, [id, fetchEventById, getEventTasks, getEventTodos, canManage])

  // Track latest search query to discard stale responses
  const latestFacultyQuery = React.useRef('')
  const latestStudentQuery = React.useRef('')
  const latestStudentTabQuery = React.useRef('')

  // Search faculty by employee ID or name
  const handleFacultySearch = useCallback(async (query) => {
    setFacultySearchQuery(query)
    latestFacultyQuery.current = query
    if (!query.trim()) {
      setFacultySearchResults(allFaculty)
      return
    }
    setSearchingFaculty(true)
    try {
      const res = await api.get(`/users/faculty?search=${encodeURIComponent(query.trim())}`)
      // Discard if a newer query has already been issued
      if (latestFacultyQuery.current === query) {
        setFacultySearchResults(res.data.data || [])
      }
    } catch {
      if (latestFacultyQuery.current === query) {
        const q = query.toLowerCase()
        setFacultySearchResults(allFaculty.filter(f =>
          f.firstName?.toLowerCase().includes(q) ||
          f.lastName?.toLowerCase().includes(q) ||
          f.employeeId?.toLowerCase().includes(q)
        ))
      }
    } finally {
      if (latestFacultyQuery.current === query) setSearchingFaculty(false)
    }
  }, [allFaculty])

  // Search students by registration number or name
  const handleStudentSearch = useCallback(async (query) => {
    setStudentSearchQuery(query)
    latestStudentQuery.current = query
    if (!query.trim()) {
      setStudentSearchResults(students)
      return
    }
    setSearchingStudents(true)
    try {
      const res = await api.get(`/users/students?search=${encodeURIComponent(query.trim())}`)
      if (latestStudentQuery.current === query) {
        setStudentSearchResults(res.data.data || [])
      }
    } catch {
      if (latestStudentQuery.current === query) {
        const q = query.toLowerCase()
        setStudentSearchResults(students.filter(s =>
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.registrationNumber?.toLowerCase().includes(q)
        ))
      }
    } finally {
      if (latestStudentQuery.current === query) setSearchingStudents(false)
    }
  }, [students])

  // ── Student tab search ────────────────────────────────────────────────────
  const handleStudentTabSearch = useCallback(async (query) => {
    setStudentTabSearchQuery(query)
    latestStudentTabQuery.current = query
    if (!query.trim()) {
      setStudentTabSearchResults(students)
      return
    }
    setSearchingStudentTab(true)
    try {
      const res = await api.get(`/users/students?search=${encodeURIComponent(query.trim())}`)
      if (latestStudentTabQuery.current === query) {
        setStudentTabSearchResults(res.data.data || [])
      }
    } catch {
      if (latestStudentTabQuery.current === query) {
        const q = query.toLowerCase()
        setStudentTabSearchResults(students.filter(s =>
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.registrationNumber?.toLowerCase().includes(q)
        ))
      }
    } finally {
      if (latestStudentTabQuery.current === query) setSearchingStudentTab(false)
    }
  }, [students])

  // ── Assign student to event ────────────────────────────────────────────────
  const handleAssignStudent = async (studentId) => {
    setAssigningStudentId(studentId)
    try {
      const currentIds = (event.assignedStudents || []).map(s => typeof s === 'object' ? s._id : s)
      const newIds = [...new Set([...currentIds, studentId])]
      await api.put(`/events/${id}/assign-students`, { studentIds: newIds })
      await fetchEventById(id)
      toast.success('Student assigned to event!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign student')
    } finally { setAssigningStudentId(null) }
  }

  const handleRemoveStudent = async (studentId) => {
    setRemovingStudentId(studentId)
    try {
      const currentIds = (event.assignedStudents || []).map(s => typeof s === 'object' ? s._id : s)
      const newIds = currentIds.filter(sid => String(sid) !== String(studentId))
      await api.put(`/events/${id}/assign-students`, { studentIds: newIds })
      await fetchEventById(id)
      toast.success('Student removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove student')
    } finally { setRemovingStudentId(null) }
  }

  // ── Assign faculty (admin) ───────────────────────────────────────────────────
  const handleAssignFaculty = async () => {
    if (!selectedFacultyId) return
    setAssigningFaculty(true)
    try {
      await api.put(`/events/${id}/assign-faculty`, { facultyId: selectedFacultyId, action: 'add' })
      await fetchEventById(id)
      setSelectedFacultyId('')
      toast.success('Faculty assigned to event!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign faculty')
    } finally { setAssigningFaculty(false) }
  }

  const handleRemoveFaculty = async (facultyId) => {
    setRemovingFacultyId(facultyId)
    try {
      await api.put(`/events/${id}/assign-faculty`, { facultyId, action: 'remove' })
      await fetchEventById(id)
      toast.success('Faculty removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove faculty')
    } finally { setRemovingFacultyId(null) }
  }

  // ── Todo handlers ──────────────────────────────────────────────────────────
  const handleAddTodo = async (e) => {
    e.preventDefault()
    try {
      await createTodo({ event: id, title: todoTitle, audience: todoAudience, isImportant: todoIsImportant })
      setTodoTitle(''); setTodoAudience('all'); setTodoIsImportant(false); setShowTodoForm(false)
      toast.success('Todo added!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add todo') }
  }

  // ── Complete event handler ────────────────────────────────────────────────
  const handleCompleteEvent = async () => {
    try {
      await completeEvent(id)
      toast.success('Event marked as completed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete event')
    }
  }

  // ── Registration Toggle (Admin) ──────────────────────────────────────────
  const handleToggleRegistration = async () => {
    try {
      await api.patch(`/events/${id}/registration-toggle`, { open: !event.registrationOpen })
      await fetchEventById(id)
      toast.success('Registration status updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update registration status')
    }
  }

  // ── Task handlers ──────────────────────────────────────────────────────────
  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      await createTask({ event: id, title: taskTitle, assignedTo: taskAssignedTo, priority: taskPriority, dueDate: taskDueDate, notes: taskNotes })
      setTaskTitle(''); setTaskAssignedTo(''); setTaskPriority('Medium'); setTaskDueDate(''); setTaskNotes('')
      setShowTaskForm(false)
      toast.success('Task assigned!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign task') }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none'
  const btnPrimary = 'px-4 py-2 bg-primary text-on-primary rounded-btn text-sm font-semibold hover:opacity-90 transition-all shadow-sm'
  const btnCancel = 'px-4 py-2 text-on-surface-variant border border-outline-variant rounded-lg text-sm hover:bg-surface-container transition-all'

  if (eventLoading) return (
    <PageWrapper>
      <div className="max-w-[1200px] mx-auto text-center py-20 text-on-surface-variant">Loading…</div>
    </PageWrapper>
  )

  if (!event) return (
    <PageWrapper>
      <div className="max-w-[1200px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant mb-6">
          <ChevronLeft size={20} /> Back
        </button>
        <div className="text-center py-12 text-on-surface-variant">Event not found</div>
      </div>
    </PageWrapper>
  )

  const assignedFacultyIds = new Set(
    (event.assignedFaculty || []).map(f => String(typeof f === 'object' ? f._id : f))
  )
  const availableFaculty = allFaculty.filter(f => !assignedFacultyIds.has(String(f._id)))

  return (
    <PageWrapper>
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Back + Edit + Registrations */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium">
            <ChevronLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {canManage && normalizeEventStatus(event?.status) === 'approved' && (
              <button
                onClick={() => navigate(isAdmin ? `/admin/events/${id}/registrations` : `/faculty/events/${id}/registrations`)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Users size={14} /> Registrations
              </button>
            )}
            {canManage && (
              <button
                onClick={() => navigate(isAdmin ? `/admin/events/${id}/edit` : `/faculty/events/${id}/edit`)}
                className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Edit Event
              </button>
            )}
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} className="w-full h-52 object-cover rounded-lg mb-5" />
          )}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl font-bold shrink-0">
                {event.title?.[0]}
              </div>
              <div>
                <h1 className="text-headline-lg text-on-surface font-bold">{event.title}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><CalendarDays size={15} />{event.startDate ? `${new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${event.endDate && event.endDate !== event.startDate ? ` - ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : '—'}</span>
                  {event.time && <span className="flex items-center gap-1"><Clock size={15} />{event.time}</span>}
                  <span className="flex items-center gap-1"><MapPin size={15} />{event.venue}</span>
                </div>
                {event.description && <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{event.description}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {event.isImportant && <Star className="text-amber-500" size={20} fill="currentColor" />}
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                normalizeEventStatus(event.status) === 'approved' ? 'bg-green-100 text-green-700' :
                event.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-purple-100 text-purple-700'
              }`}>{event.status}</span>
            </div>
          </div>

          {/* Quick summary chips for admin */}
          {isAdmin && (
            <div className="mt-5 pt-5 border-t border-outline-variant flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-xs font-semibold">
                <GraduationCap size={14} />
                {(event.assignedFaculty || []).length} Faculty assigned
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                <Users size={14} />
                {(event.assignedStudents || []).length} Students assigned
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <CheckCircle2 size={14} />
                {tasks.filter(t => t.isDone).length}/{tasks.length} Tasks done
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-5 pt-5 border-t border-outline-variant space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={event.registrationOpen}
                  onChange={handleToggleRegistration}
                  className="w-5 h-5 accent-primary rounded"
                />
                <div>
                  <span className="text-sm font-medium text-on-surface block">Registrations Open</span>
                  <span className="text-xs text-on-surface-variant">Toggle whether students can currently register for this event.</span>
                </div>
              </label>
            </div>
          )}

          {/* Complete event checkbox (for admin/faculty) */}
          {canManage && event.status !== 'completed' && (
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={handleCompleteEvent}
                  className="w-5 h-5 accent-primary rounded"
                />
                <span className="text-sm font-medium text-on-surface">Mark event as completed</span>
              </label>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-outline-variant">
          {[
            { key: 'todos', label: 'Todo List' },
            { key: 'tasks', label: 'Assigned Tasks' },
            ...(canManage ? [{ key: 'students', label: 'Assign Students', icon: <Users size={15} />, count: (event.assignedStudents || []).length }] : []),
            ...(isAdmin ? [{ key: 'faculty', label: 'Assign Faculty', icon: <GraduationCap size={15} />, count: (event.assignedFaculty || []).length }] : []),
            ...(isAdmin ? [{ key: 'overview', label: 'Overview', icon: <Users size={15} /> }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.icon}{tab.label}
              {tab.count > 0 && <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ── TODO TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'todos' && (
          <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-on-surface text-lg">Todo List</h3>
              {canManage && (
                <button onClick={() => setShowTodoForm(v => !v)} className={btnPrimary}>
                  <Plus size={16} className="inline mr-1" />Add Todo
                </button>
              )}
            </div>
            {showTodoForm && (
              <form onSubmit={handleAddTodo} className="mb-5 bg-surface-container rounded-xl p-4 border border-outline-variant space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                  <input className={inputCls} value={todoTitle} onChange={e => setTodoTitle(e.target.value)} placeholder="Enter todo title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Audience</label>
                    <select className={inputCls} value={todoAudience} onChange={e => setTodoAudience(e.target.value)}>
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="imp" checked={todoIsImportant} onChange={e => setTodoIsImportant(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <label htmlFor="imp" className="text-sm text-on-surface-variant">Mark important</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowTodoForm(false)} className={btnCancel}>Cancel</button>
                  <button type="submit" className={btnPrimary}>Add Todo</button>
                </div>
              </form>
            )}

            {/* Manual todos */}
            {todos.length > 0 && (
              <div className="space-y-3">
                {todos.map(todo => {
                  const done = todo.completedBy?.some(u => (typeof u === 'object' ? u._id : u) === user?._id)
                  return (
                    <div key={todo._id} className="flex items-start justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                      <div className="flex gap-3">
                        <button onClick={() => completeTodo(todo._id)} className={`p-2 rounded-lg shrink-0 mt-0.5 ${done ? 'bg-green-100 text-green-700' : 'text-outline-variant hover:bg-surface-container-high'}`}>
                          <CheckCircle2 size={18} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{todo.title}</p>
                            {todo.isImportant && <Star size={14} className="text-amber-500" fill="currentColor" />}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            Audience: {todo.audience} · By: {todo.createdBy?.firstName} {todo.createdBy?.lastName}
                          </p>
                          {todo.completedBy?.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              Completed by: {todo.completedBy.map((s, i) => <span key={i}>{typeof s === 'object' ? `${s.firstName} ${s.lastName}` : s}{i < todo.completedBy.length - 1 ? ', ' : ''}</span>)}
                            </p>
                          )}
                        </div>
                      </div>
                      {canManage && <button onClick={() => deleteTodo(todo._id)} className="p-2 text-error hover:bg-error/10 rounded-lg shrink-0"><Trash2 size={16} /></button>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Assigned tasks shown as checklist items */}
            {tasks.length > 0 && (
              <div className={todos.length > 0 ? 'mt-6 pt-6 border-t border-outline-variant space-y-2' : 'space-y-2'}>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={13} />
                  Assigned Tasks ({tasks.filter(t => t.isDone).length}/{tasks.length} done)
                </p>
                {tasks.map(task => (
                  <div key={task._id} className={`flex items-center justify-between p-3 rounded-xl border ${task.isDone ? 'bg-green-50 border-green-200' : 'bg-surface-container border-outline-variant'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${task.isDone ? 'bg-green-500' : 'border-2 border-outline-variant'}`}>
                        {task.isDone && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${task.isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Assigned to: {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                          {task.priority && <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{task.priority}</span>}
                        </p>
                      </div>
                    </div>
                    {task.isDone && (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {todos.length === 0 && tasks.length === 0 && (
              <p className="text-center py-10 text-on-surface-variant text-sm">No todos yet. Use "+ Add Todo" to create checklist items.</p>
            )}
          </div>
        )}

        {/* ── TASKS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'tasks' && (
          <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-on-surface text-lg">Assigned Tasks</h3>
              {canManage && (
                <button onClick={() => setShowTaskForm(v => !v)} className={btnPrimary}>
                  <Plus size={16} className="inline mr-1" />Assign Task
                </button>
              )}
            </div>
            {showTaskForm && (
              <form onSubmit={handleAddTask} className="mb-5 bg-surface-container rounded-xl p-4 border border-outline-variant space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Task Title</label>
                  <input className={inputCls} value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Enter task title" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">
                      Assign to {isAdmin ? 'Faculty' : 'Student'}
                    </label>
                    {!isAdmin && (
                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <input
                          type="text"
                          placeholder="Search by Reg. No. or name…"
                          value={studentSearchQuery}
                          onChange={e => handleStudentSearch(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                      </div>
                    )}
                    <select className={inputCls} value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} required>
                      <option value="">Select {isAdmin ? 'faculty member' : 'student'}…</option>
                      {isAdmin
                        ? allFaculty.map(f => (
                            <option key={f._id} value={f._id}>
                              {f.firstName} {f.lastName}{f.employeeId ? ` [${f.employeeId}]` : ''}{f.department ? ` — ${f.department}` : ''}
                            </option>
                          ))
                        : (studentSearchQuery ? studentSearchResults : students).map(s => (
                            <option key={s._id} value={s._id}>
                              {s.firstName} {s.lastName} ({s.registrationNumber || s.officialEmail})
                            </option>
                          ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Priority</label>
                    <select className={inputCls} value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Due Date</label>
                    <input type="date" className={inputCls} value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Notes</label>
                    <input className={inputCls} value={taskNotes} onChange={e => setTaskNotes(e.target.value)} placeholder="Optional notes" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowTaskForm(false)} className={btnCancel}>Cancel</button>
                  <button type="submit" className={btnPrimary}>Assign Task</button>
                </div>
              </form>
            )}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center py-10 text-on-surface-variant text-sm">No tasks assigned yet</p>
              ) : tasks.map(task => (
                <div key={task._id} className="flex items-start justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                  <div className="flex gap-3">
                    <button
                      onClick={() => completeTask(task._id)}
                      disabled={task.isDone}
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${task.isDone ? 'bg-green-100 text-green-700' : 'text-outline-variant hover:bg-surface-container-high'}`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-medium text-sm ${task.isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{task.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>{task.priority}</span>
                        {task.isDone && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">Done</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><User size={12} />By: {task.createdBy?.firstName} {task.createdBy?.lastName}</span>
                        <span className="flex items-center gap-1"><User size={12} />To: {task.assignedTo?.firstName} {task.assignedTo?.lastName}</span>
                        {task.dueDate && <span className="flex items-center gap-1"><CalendarDays size={12} />Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      {task.notes && <p className="mt-1 text-xs text-on-surface-variant italic">{task.notes}</p>}
                    </div>
                  </div>
                  {canManage && <button onClick={() => deleteTask(task._id)} className="p-2 text-error hover:bg-error/10 rounded-lg shrink-0"><Trash2 size={16} /></button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ASSIGN STUDENTS TAB (admin + faculty) ─────────────────────── */}
        {activeTab === 'students' && canManage && (() => {
          const assignedStudentIds = new Set(
            (event.assignedStudents || []).map(s => String(typeof s === 'object' ? s._id : s))
          )
          const availableInResults = studentTabSearchResults.filter(s => !assignedStudentIds.has(String(s._id)))
          return (
            <div className="space-y-5">
              {/* Search + assign panel */}
              <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
                <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Assign Students to this Event
                </h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Search by registration number or name, then click Assign to add a student.
                </p>

                {/* Search input */}
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search by Reg. No. or name…"
                    value={studentTabSearchQuery}
                    onChange={e => handleStudentTabSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  {searchingStudentTab && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">Searching…</span>
                  )}
                </div>

                {/* Results list */}
                {availableInResults.length > 0 ? (
                  <div className="border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant max-h-64 overflow-y-auto">
                    {availableInResults.map(s => (
                      <div key={s._id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-on-surface-variant">{s.registrationNumber || s.officialEmail}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignStudent(s._id)}
                          disabled={assigningStudentId === s._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-btn text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                        >
                          <UserPlus size={13} />
                          {assigningStudentId === s._id ? 'Assigning…' : 'Assign'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !searchingStudentTab && studentTabSearchQuery.trim() ? (
                  <p className="text-sm text-on-surface-variant mt-2">No students found matching your search.</p>
                ) : null}
              </div>

              {/* Currently assigned students */}
              <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
                <h3 className="font-bold text-on-surface text-base mb-4">
                  Assigned Students
                  <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {(event.assignedStudents || []).length}
                  </span>
                </h3>
                {(event.assignedStudents || []).length === 0 ? (
                  <div className="py-10 text-center">
                    <Users size={36} className="mx-auto text-on-surface-variant opacity-30 mb-3" />
                    <p className="text-sm text-on-surface-variant">No students assigned yet.</p>
                    <p className="text-xs text-on-surface-variant mt-1">Search above to assign students.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(event.assignedStudents || []).map(s => {
                      const sId = typeof s === 'object' ? s._id : s
                      const sObj = typeof s === 'object' ? s : students.find(st => st._id === s)
                      return (
                        <div key={sId} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {sObj?.firstName?.[0]}{sObj?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-on-surface">
                                {sObj ? `${sObj.firstName} ${sObj.lastName}` : 'Student'}
                              </p>
                              {sObj?.registrationNumber && (
                                <p className="text-xs text-on-surface-variant">{sObj.registrationNumber}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(sId)}
                            disabled={removingStudentId === sId}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-40"
                            title="Remove from event"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── ASSIGN FACULTY TAB (admin only) ───────────────────────────── */}
        {activeTab === 'faculty' && isAdmin && (
          <div className="space-y-5">
            {/* Add faculty panel */}
            <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
              <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-primary" />
                Assign Faculty to this Event
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Faculty members assigned here will be able to manage this event, assign students, and create tasks.
              </p>

              {/* Search by Employee ID or name */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search by Employee ID or name…"
                  value={facultySearchQuery}
                  onChange={e => handleFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                {searchingFaculty && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">Searching…</span>
                )}
              </div>

              <div className="flex gap-3">
                <select
                  className={`flex-1 ${inputCls}`}
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">Select faculty member to assign…</option>
                  {facultySearchResults
                    .filter(f => !assignedFacultyIds.has(String(f._id)))
                    .map(f => (
                      <option key={f._id} value={f._id}>
                        {f.firstName} {f.lastName}{f.employeeId ? ` [${f.employeeId}]` : ''}{f.department ? ` — ${f.department}` : ''}{f.designation ? ` (${f.designation})` : ''}
                      </option>
                    ))
                  }
                </select>
                <button
                  onClick={handleAssignFaculty}
                  disabled={!selectedFacultyId || assigningFaculty}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-btn text-sm font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} />
                  {assigningFaculty ? 'Assigning…' : 'Assign'}
                </button>
              </div>
              {facultySearchResults.filter(f => !assignedFacultyIds.has(String(f._id))).length === 0 && !searchingFaculty && (
                <p className="mt-2 text-xs text-on-surface-variant">
                  {facultySearchQuery ? 'No faculty found matching your search.' : 'All faculty are already assigned to this event.'}
                </p>
              )}
            </div>

            {/* Currently assigned faculty list */}
            <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
              <h3 className="font-bold text-on-surface text-base mb-4">
                Currently Assigned Faculty
                <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {(event.assignedFaculty || []).length}
                </span>
              </h3>
              {(event.assignedFaculty || []).length === 0 ? (
                <div className="py-10 text-center">
                  <GraduationCap size={36} className="mx-auto text-on-surface-variant opacity-30 mb-3" />
                  <p className="text-sm text-on-surface-variant">No faculty assigned yet.</p>
                  <p className="text-xs text-on-surface-variant mt-1">Use the panel above to assign faculty members.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(event.assignedFaculty || []).map(f => {
                    const fId = typeof f === 'object' ? f._id : f
                    const fObj = typeof f === 'object' ? f : allFaculty.find(fl => fl._id === f)
                    const facultyTasks = tasks.filter(t => (typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo) === fId)
                    const doneTasks = facultyTasks.filter(t => t.isDone)
                    return (
                      <div key={fId} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                            {fObj?.firstName?.[0]}{fObj?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">
                              {fObj ? `${fObj.firstName} ${fObj.lastName}` : 'Faculty Member'}
                            </p>
                            {fObj?.department && <p className="text-xs text-on-surface-variant">{fObj.department}{fObj.designation ? ` · ${fObj.designation}` : ''}</p>}
                            {facultyTasks.length > 0 && (
                              <p className="text-xs text-on-surface-variant mt-1">
                                Tasks: <span className="text-green-600 font-semibold">{doneTasks.length} done</span> / {facultyTasks.length} total
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFaculty(fId)}
                          disabled={removingFacultyId === fId}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-40"
                          title="Remove from event"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── OVERVIEW TAB (admin only) ──────────────────────────────────── */}
        {activeTab === 'overview' && isAdmin && (
          <div className="space-y-5">

            {/* Task progress summary */}
            <div className="bg-surface-card border border-outline-variant rounded-xl p-6">
              <h3 className="font-bold text-on-surface text-lg mb-5 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Event Overview
              </h3>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Faculty', value: (event.assignedFaculty || []).length, color: 'bg-secondary/10 text-secondary' },
                  { label: 'Students', value: (event.assignedStudents || []).length, color: 'bg-primary/10 text-primary' },
                  { label: 'Total Tasks', value: tasks.length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Tasks Done', value: tasks.filter(t => t.isDone).length, color: 'bg-green-50 text-green-700' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                    <span>Task Completion</span>
                    <span className="font-semibold">{Math.round((tasks.filter(t => t.isDone).length / tasks.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(tasks.filter(t => t.isDone).length / tasks.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* All tasks list with assignee info */}
              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-3">All Tasks</h4>
                {tasks.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-6 text-center">No tasks created yet</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${task.isDone ? 'bg-green-100' : 'bg-surface-container-high'}`}>
                          {task.isDone && <CheckCircle2 size={14} className="text-green-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{task.title}</p>
                          <p className="text-xs text-on-surface-variant">
                            Assigned to: <span className="font-medium">{task.assignedTo?.firstName} {task.assignedTo?.lastName}</span>
                            {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>{task.priority}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </PageWrapper>
  )
}
