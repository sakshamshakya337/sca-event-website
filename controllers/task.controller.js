import Task from '../models/Task.js'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

const TASK_ASSIGNER_ROLES = ['faculty', 'hod', 'hos', 'dean', 'admin', 'superadmin']
const EVENT_OVERVIEW_ROLES = ['admin', 'superadmin', 'dean', 'hos']

/** Higher roles assign downward only. Students never assign. */
const ASSIGNABLE_ROLES = {
  superadmin: ['dean', 'hos', 'hod', 'faculty', 'student'],
  admin: ['dean', 'hos', 'hod', 'faculty', 'student'],
  dean: ['hos', 'hod', 'faculty', 'student'],
  hos: ['hod', 'faculty', 'student'],
  hod: ['faculty', 'student'],
  faculty: ['student'],
}

const TASK_POPULATE = [
  { path: 'event', select: 'title date' },
  { path: 'createdBy', select: 'firstName lastName role' },
  { path: 'assignedTo', select: 'firstName lastName role' },
]

const populateTask = (docOrQuery) => docOrQuery.populate(TASK_POPULATE)

const idOf = (doc) => (doc?._id ?? doc)?.toString?.() ?? ''

const isEventOverviewViewer = (user, event) => {
  const userId = user.id.toString()
  const isCreator = event.createdBy ? idOf(event.createdBy) === userId : false
  return EVENT_OVERVIEW_ROLES.includes(user.role) || isCreator
}

// Get my tasks (only tasks assigned to the current user)
export const getMyTasks = async (req, res, next) => {
  try {
    const { isDone } = req.query
    const filter = { assignedTo: req.user.id }
    if (isDone !== undefined) filter.isDone = isDone === 'true'

    const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1 }))

    res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get tasks for an event
export const getEventTasks = async (req, res, next) => {
  try {
    const eventId = req.params.eventId

    const Event = (await import('../models/Event.js')).default
    const mongoose = (await import('mongoose')).default

    const isObjectId = mongoose.Types.ObjectId.isValid(eventId)
    const event = isObjectId
      ? await Event.findById(eventId)
      : await Event.findOne({ slug: eventId })

    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const userId = req.user.id.toString()
    const isAssignedFaculty = (event.assignedFaculty || []).some(f => f && idOf(f) === userId)
    const isAssignedStudent = (event.assignedStudents || []).some(s => s && idOf(s) === userId)

    let filter = { event: event._id }

    if (req.user.role === 'student' || (isAssignedStudent && !isAssignedFaculty && !isEventOverviewViewer(req.user, event))) {
      // Students only see tasks assigned to them — never the whole event list
      filter.assignedTo = req.user.id
    } else if (!isEventOverviewViewer(req.user, event) && (isAssignedFaculty || ['faculty', 'hod'].includes(req.user.role))) {
      // Faculty/HOD see only their own assignment plus tasks they delegated
      filter.$or = [{ assignedTo: req.user.id }, { createdBy: req.user.id }]
    }

    const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1 }))
    res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Create task
export const createTask = async (req, res, next) => {
  try {
    if (!TASK_ASSIGNER_ROLES.includes(req.user.role)) {
      throw new ApiError(403, 'Students cannot assign tasks. You can only mark your own tasks complete.')
    }

    const { title, event, assignedTo, priority, dueDate, notes } = req.body
    if (!title?.trim()) throw new ApiError(400, 'Task title is required')
    if (!assignedTo) throw new ApiError(400, 'Please select who this task is assigned to')

    const assignee = await User.findById(assignedTo).select('role firstName lastName isActive')
    if (!assignee || !assignee.isActive) {
      throw new ApiError(404, 'Assignee not found')
    }

    const allowedRoles = ASSIGNABLE_ROLES[req.user.role] || []
    if (!allowedRoles.includes(assignee.role)) {
      throw new ApiError(403, `You cannot assign tasks to ${assignee.role}. Assign downward only.`)
    }

    const duplicate = await Task.findOne({
      event,
      assignedTo,
      title: title.trim(),
      isDone: false,
    })
    if (duplicate) {
      throw new ApiError(409, 'This person already has a pending task with the same title')
    }

    const task = await Task.create({
      title: title.trim(),
      event,
      assignedTo,
      priority,
      dueDate,
      notes,
      createdBy: req.user.id,
    })
    await populateTask(task)
    res.status(201).json(new ApiResponse(201, task, 'Task created successfully'))
  } catch (error) {
    next(error)
  }
}

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }

    const isCreator = task.createdBy?.toString() === req.user.id.toString()
    if (!isCreator && !EVENT_OVERVIEW_ROLES.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to update this task')
    }

    const { title, priority, dueDate, notes } = req.body
    if (title) task.title = title
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (notes) task.notes = notes
    await task.save()
    await populateTask(task)
    res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark task as done — only the assignee (students and faculty for their own tasks)
export const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }
    if (task.assignedTo.toString() !== req.user.id.toString()) {
      throw new ApiError(403, 'Only the assigned person can mark this task complete')
    }
    task.isDone = true
    task.doneAt = new Date()
    await task.save()
    await populateTask(task)
    res.status(200).json(new ApiResponse(200, task, 'Task marked as done'))
  } catch (error) {
    next(error)
  }
}

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      throw new ApiError(403, 'Students cannot delete tasks')
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }

    const isCreator = task.createdBy?.toString() === req.user.id.toString()
    if (!isCreator && !EVENT_OVERVIEW_ROLES.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to delete this task')
    }

    await Task.findByIdAndDelete(req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'))
  } catch (error) {
    next(error)
  }
}
