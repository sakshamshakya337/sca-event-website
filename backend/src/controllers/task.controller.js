import Task from '../models/Task.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

// Get my tasks
export const getMyTasks = async (req, res, next) => {
  try {
    const { isDone } = req.query
    const filter = { assignedTo: req.user.id }
    if (isDone !== undefined) filter.isDone = isDone === 'true'

    const tasks = await Task.find(filter)
      .populate('event', 'title date')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ dueDate: 1 })

    res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get tasks for an event
export const getEventTasks = async (req, res, next) => {
  try {
    const eventId = req.params.eventId
    
    // Get the event to check assignments
    const Event = (await import('../models/Event.js')).default
    const event = await Event.findById(eventId)
    
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }
    
    // Build filter based on user role
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role)
    const isCreator = event.createdBy.toString() === req.user.id.toString()
    const isAssignedFaculty = event.assignedFaculty.some(f => f.toString() === req.user.id.toString())
    const isAssignedStudent = event.assignedStudents.some(s => s.toString() === req.user.id.toString())
    
    // Admin/superadmin, creator, or assigned users see all tasks
    if (isAdmin || isCreator || isAssignedFaculty || isAssignedStudent) {
      const tasks = await Task.find({ event: eventId })
        .populate('event', 'title date')
        .populate('createdBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName')
        .sort({ dueDate: 1 })
      return res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'))
    }
    
    // For other users (students not assigned to event), show only tasks assigned to them
    const tasks = await Task.find({ 
      event: eventId,
      assignedTo: req.user.id
    })
      .populate('event', 'title date')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ dueDate: 1 })
    
    res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Create task
export const createTask = async (req, res, next) => {
  try {
    const { title, event, assignedTo, priority, dueDate, notes } = req.body
    const task = await Task.create({
      title,
      event,
      assignedTo,
      priority,
      dueDate,
      notes,
      createdBy: req.user.id
    })
    await task.populate('event createdBy assignedTo', 'title date firstName lastName')
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
    const { title, priority, dueDate, notes } = req.body
    if (title) task.title = title
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (notes) task.notes = notes
    await task.save()
    await task.populate('event createdBy assignedTo', 'title date firstName lastName')
    res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark task as done
export const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }
    // Only assignee can mark as done
    if (task.assignedTo.toString() !== req.user.id.toString()) {
      throw new ApiError(403, 'Not authorized')
    }
    task.isDone = true
    task.doneAt = new Date()
    await task.save()
    await task.populate('event createdBy assignedTo', 'title date firstName lastName')
    res.status(200).json(new ApiResponse(200, task, 'Task marked as done'))
  } catch (error) {
    next(error)
  }
}

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      throw new ApiError(404, 'Task not found')
    }
    await Task.findByIdAndDelete(req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'))
  } catch (error) {
    next(error)
  }
}
