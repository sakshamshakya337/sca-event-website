import Todo from '../models/Todo.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

// Get todos for an event
export const getEventTodos = async (req, res, next) => {
  try {
    const eventId = req.params.eventId
    
    // Get the event to check assignments
    const Event = (await import('../models/Event.js')).default
    const event = await Event.findById(eventId)
    
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }
    
    // Build filter based on user role
    const userId = req.user.id.toString()
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role)
    const isCreator = event.createdBy ? (event.createdBy._id ?? event.createdBy).toString() === userId : false
    const isAssignedFaculty = (event.assignedFaculty || []).some(f => f && (f._id ?? f).toString() === userId)
    const isAssignedStudent = (event.assignedStudents || []).some(s => s && (s._id ?? s).toString() === userId)
    
    // Admin/superadmin, creator, or assigned users see all todos
    if (isAdmin || isCreator || isAssignedFaculty || isAssignedStudent) {
      const todos = await Todo.find({ event: eventId })
        .populate('createdBy', 'firstName lastName registrationNumber officialEmail')
        .populate('completedBy', 'firstName lastName registrationNumber officialEmail')
        .sort({ createdAt: -1 })
      return res.status(200).json(new ApiResponse(200, todos, 'Todos fetched successfully'))
    }
    
    // For other users (students not assigned to event), show only public todos
    const todos = await Todo.find({ 
      event: eventId,
      audience: { $in: ['all', 'students'] }
    })
      .populate('createdBy', 'firstName lastName registrationNumber officialEmail')
      .populate('completedBy', 'firstName lastName registrationNumber officialEmail')
      .sort({ createdAt: -1 })
    
    res.status(200).json(new ApiResponse(200, todos, 'Todos fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Create todo
export const createTodo = async (req, res, next) => {
  try {
    const { event, title, audience, isImportant } = req.body
    const todo = await Todo.create({
      event,
      title,
      audience,
      isImportant,
      createdBy: req.user.id
    })
    await todo.populate('createdBy', 'firstName lastName')
    res.status(201).json(new ApiResponse(201, todo, 'Todo created successfully'))
  } catch (error) {
    next(error)
  }
}

// Update todo
export const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      throw new ApiError(404, 'Todo not found')
    }
    const { title, audience, isImportant } = req.body
    if (title) todo.title = title
    if (audience) todo.audience = audience
    if (typeof isImportant === 'boolean') todo.isImportant = isImportant
    await todo.save()
    await todo.populate('createdBy', 'firstName lastName')
    res.status(200).json(new ApiResponse(200, todo, 'Todo updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark todo as completed
export const completeTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      throw new ApiError(404, 'Todo not found')
    }
    if (!todo.completedBy.includes(req.user.id)) {
      todo.completedBy.push(req.user.id)
    }
    await todo.save()
    await todo.populate('createdBy', 'firstName lastName registrationNumber officialEmail')
    await todo.populate('completedBy', 'firstName lastName registrationNumber officialEmail')
    res.status(200).json(new ApiResponse(200, todo, 'Todo marked as completed'))
  } catch (error) {
    next(error)
  }
}

// Delete todo
export const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      throw new ApiError(404, 'Todo not found')
    }
    await Todo.findByIdAndDelete(req.params.id)
    res.status(200).json(new ApiResponse(200, null, 'Todo deleted successfully'))
  } catch (error) {
    next(error)
  }
}
