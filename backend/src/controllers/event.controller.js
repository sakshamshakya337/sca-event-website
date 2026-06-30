import Event from '../models/Event.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import multer from 'multer'
import cloudinary from '../config/cloudinary.js'

const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new ApiError(400, 'Event image must be an image'))
      return
    }
    cb(null, true)
  }
})

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(new ApiError(400, error.message || 'Failed to upload event image'))
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

// Get all events (role-based filtering)
export const getAllEvents = async (req, res, next) => {
  try {
    const { status, type } = req.query
    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type

    // Role-based filtering
    if (req.user.role === 'faculty') {
      // Faculty can see events they created or are assigned to
      filter.$or = [
        { createdBy: req.user.id },
        { assignedFaculty: req.user.id }
      ]
    } else if (req.user.role === 'student') {
      // Student can only see events they are assigned to
      filter.assignedStudents = req.user.id
    }
    // Admins and superadmins see all events

    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('assignedFaculty', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName')
      .sort({ date: -1 })

    res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get approved events for public landing page
export const getApprovedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .sort({ date: 1 })
      .select('title type date time venue description imageUrl registerLink registrationNotRequired')
      .populate('assignedFaculty', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, events, 'Approved events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get events for current faculty
export const getMyEvents = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = {
      $or: [
        { createdBy: req.user.id },
        { assignedFaculty: req.user.id }
      ]
    }
    if (status) filter.status = status

    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedFaculty', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName')
      .sort({ date: -1 })

    res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single event (role-based check)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('assignedFaculty', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName')

    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    // Check if user is authorized to view this event
    const isAuthorized = 
      // Admin/superadmin can see all
      ['admin', 'superadmin'].includes(req.user.role) ||
      // Creator can see it
      event.createdBy._id.toString() === req.user.id.toString() ||
      // Assigned faculty can see it
      event.assignedFaculty.some(facultyId => facultyId.toString() === req.user.id.toString()) ||
      // Assigned student can see it
      event.assignedStudents.some(studentId => studentId.toString() === req.user.id.toString())

    if (!isAuthorized) {
      throw new ApiError(403, 'Not authorized to view this event')
    }

    res.status(200).json(new ApiResponse(200, event, 'Event fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Create event (faculty, admin, superadmin)
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      type,
      date,
      time,
      venue,
      expectedAudience,
      description,
      registerLink,
      assignedStudents = []
    } = req.body

    const parsedAudience = expectedAudience ? Number(expectedAudience) : undefined
    const isImportant = req.body.isImportant === 'true' || req.body.isImportant === true
    const registrationNotRequired = req.body.registrationNotRequired === 'true' || req.body.registrationNotRequired === true
    
    // Parse assignedFaculty from JSON string or use as-is
    let assignedFaculty = []
    if (req.body.assignedFaculty) {
      try {
        assignedFaculty = typeof req.body.assignedFaculty === 'string' 
          ? JSON.parse(req.body.assignedFaculty) 
          : req.body.assignedFaculty
      } catch (e) {
        assignedFaculty = []
      }
    }

    const eventData = {
      title,
      type,
      date,
      time,
      venue,
      expectedAudience: parsedAudience,
      description,
      registerLink,
      registrationNotRequired,
      isImportant,
      status: 'pending',
      createdBy: req.user.id,
      assignedFaculty,
      assignedStudents
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'sca-ems/events',
        resource_type: 'image'
      })
      eventData.imageUrl = result.secure_url
      eventData.imagePublicId = result.public_id
    }

    const event = await Event.create(eventData)

    await event.populate('createdBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(201).json(new ApiResponse(201, event, 'Event created successfully'))
  } catch (error) {
    next(error)
  }
}

// Update event
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    // Check if user is owner or admin
    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to update this event')
    }

    const {
      title,
      type,
      date,
      time,
      venue,
      expectedAudience,
      description,
      registerLink,
      assignedFaculty,
      assignedStudents
    } = req.body

    const isImportant = req.body.isImportant === 'true' || req.body.isImportant === true
    const parsedAudience = expectedAudience ? Number(expectedAudience) : undefined

    if (title) event.title = title
    if (type) event.type = type
    if (date) event.date = date
    if (time) event.time = time
    if (venue) event.venue = venue
    if (parsedAudience !== undefined) event.expectedAudience = parsedAudience
    if (description !== undefined) event.description = description
    if (registerLink !== undefined) event.registerLink = registerLink
    event.isImportant = isImportant
    if (assignedFaculty) event.assignedFaculty = assignedFaculty
    if (assignedStudents) event.assignedStudents = assignedStudents

    if (!['admin', 'superadmin'].includes(req.user.role) && event.status === 'approved') {
      event.status = 'pending'
      event.approvedBy = undefined
      event.approvedAt = undefined
    }

    let oldImagePublicId = event.imagePublicId
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'sca-ems/events',
        resource_type: 'image'
      })
      event.imageUrl = result.secure_url
      event.imagePublicId = result.public_id
    }

    await event.save()

    if (req.file && oldImagePublicId && oldImagePublicId !== event.imagePublicId) {
      await cloudinary.uploader.destroy(oldImagePublicId)
    }

    await event.populate('createdBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Approve event (admin only)
export const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    event.status = 'approved'
    event.approvedBy = req.user.id
    event.approvedAt = new Date()

    await event.save()
    await event.populate('approvedBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Event approved successfully'))
  } catch (error) {
    next(error)
  }
}

// Reject event (admin only)
export const rejectEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const { reason } = req.body
    event.status = 'rejected'
    event.rejectedReason = reason

    await event.save()
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Event rejected successfully'))
  } catch (error) {
    next(error)
  }
}

// Delete event
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    // Check if user is owner or admin
    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to delete this event')
    }

    await Event.findByIdAndDelete(req.params.id)

    res.status(200).json(new ApiResponse(200, null, 'Event deleted successfully'))
  } catch (error) {
    next(error)
  }
}

// Get event stats
export const getEventStats = async (req, res, next) => {
  try {
    let statsFilter = {}
    if (req.user.role === 'faculty') {
      statsFilter = {
        $or: [
          { createdBy: req.user.id },
          { assignedFaculty: req.user.id }
        ]
      }
    } else if (req.user.role === 'student') {
      statsFilter = { assignedStudents: req.user.id }
    }

    const totalEvents = await Event.countDocuments(statsFilter)
    const pendingEvents = await Event.countDocuments({ ...statsFilter, status: 'pending' })
    const approvedEvents = await Event.countDocuments({ ...statsFilter, status: 'approved' })
    const completedEvents = await Event.countDocuments({ ...statsFilter, status: 'completed' })

    res.status(200).json(new ApiResponse(200, { totalEvents, pendingEvents, approvedEvents, completedEvents }, 'Stats fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark event as completed
export const completeEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized')
    }

    event.status = 'completed'
    await event.save()
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Event marked as completed'))
  } catch (error) {
    next(error)
  }
}

// Assign faculty to event
export const assignFaculty = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to assign faculty')
    }

    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const { facultyIds } = req.body
    event.assignedFaculty = facultyIds

    await event.save()
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Faculty assigned successfully'))
  } catch (error) {
    next(error)
  }
}

// Assign students to event
export const assignStudents = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin', 'faculty'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to assign students')
    }

    const event = await Event.findById(req.params.id)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const { studentIds } = req.body
    event.assignedStudents = studentIds

    await event.save()
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Students assigned successfully'))
  } catch (error) {
    next(error)
  }
}
