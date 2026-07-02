import Event from '../models/Event.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import cloudinary from '../config/cloudinary.js'
import { handleEventUpload } from '../config/multer.js'

// Re-export so routes can import directly from this file if needed
export { handleEventUpload as uploadFields }

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
      .select('title type date time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery')
      .populate('assignedFaculty', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, events, 'Approved events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single approved event for public detail page (no auth)
export const getPublicEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, status: 'approved' })
      .select('title type date time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery isImportant')
      .populate('assignedFaculty', 'firstName lastName')
    if (!event) throw new ApiError(404, 'Event not found or not yet approved')
    res.status(200).json(new ApiResponse(200, event, 'Event fetched'))
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
    const userId = req.user.id.toString()
    const creatorId = event.createdBy
      ? (event.createdBy._id ?? event.createdBy).toString()
      : null

    const isAuthorized = 
      // Admin/superadmin can see all
      ['admin', 'superadmin'].includes(req.user.role) ||
      // Creator can see it
      creatorId === userId ||
      // Assigned faculty can see it
      (event.assignedFaculty || []).some(f => f && (f._id ?? f).toString() === userId) ||
      // Assigned student can see it
      (event.assignedStudents || []).some(s => s && (s._id ?? s).toString() === userId)

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
      title, type, date, time, venue, expectedAudience,
      description, registerLink, assignedStudents = []
    } = req.body

    // Validate required fields first
    if (!title || !type || !date || !venue) {
      return next(new ApiError(400, 'Missing required fields: title, type, date, venue'))
    }

    const parsedAudience = expectedAudience ? Number(expectedAudience) : undefined
    const isImportant           = req.body.isImportant           === 'true' || req.body.isImportant           === true
    const registrationNotRequired = req.body.registrationNotRequired === 'true' || req.body.registrationNotRequired === true
    const registrationOpen      = req.body.registrationOpen      === 'true' || req.body.registrationOpen      === true

    let assignedFaculty = []
    if (req.body.assignedFaculty) {
      try {
        assignedFaculty = typeof req.body.assignedFaculty === 'string'
          ? JSON.parse(req.body.assignedFaculty)
          : req.body.assignedFaculty
      } catch { assignedFaculty = [] }
    }

    const eventData = {
      title, type, date, time, venue,
      expectedAudience: parsedAudience,
      description, registerLink,
      registrationNotRequired, registrationOpen, isImportant,
      status: 'pending',
      createdBy: req.user.id,
      assignedFaculty, assignedStudents,
      gallery: []  // Initialize empty to prevent undefined issues
    }

    // Banner image
    const bannerFile = req?.files?.image?.[0] ?? req?.file
    if (bannerFile) {
      try {
        const result = await uploadToCloudinary(bannerFile.buffer, { folder: 'sca-ems/events' })
        eventData.imageUrl      = result.secure_url
        eventData.imagePublicId = result.public_id
      } catch (uploadErr) {
        console.error('Banner upload failed:', uploadErr)
        return next(new ApiError(400, 'Failed to upload banner image'))
      }
    }

    // Gallery images (up to 6)
    const galleryFiles = req?.files?.gallery ?? []
    if (galleryFiles.length > 0) {
      try {
        const galleryUploads = await Promise.all(
          galleryFiles.map(f => uploadToCloudinary(f.buffer, { folder: 'sca-ems/events/gallery' }))
        )
        eventData.gallery = galleryUploads.map(r => ({ url: r.secure_url, publicId: r.public_id }))
      } catch (uploadErr) {
        console.error('Gallery upload failed:', uploadErr)
        return next(new ApiError(400, 'Failed to upload gallery images'))
      }
    }

    const event = await Event.create(eventData)
    await event.populate('createdBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')

    res.status(201).json(new ApiResponse(201, event, 'Event created successfully'))
  } catch (error) {
    console.error('Create event error:', error)
    next(error)
  }
}

// Update event
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) throw new ApiError(404, 'Event not found')

    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to update this event')
    }

    const { title, type, date, time, venue, expectedAudience, description, registerLink, assignedFaculty, assignedStudents } = req.body
    const isImportant           = req.body.isImportant           === 'true' || req.body.isImportant           === true
    const registrationNotRequired = req.body.registrationNotRequired === 'true' || req.body.registrationNotRequired === true
    const registrationOpen      = req.body.registrationOpen      === 'true' || req.body.registrationOpen      === true
    const parsedAudience        = expectedAudience ? Number(expectedAudience) : undefined

    if (title)                    event.title             = title
    if (type)                     event.type              = type
    if (date)                     event.date              = date
    if (time !== undefined)       event.time              = time
    if (venue)                    event.venue             = venue
    if (parsedAudience !== undefined) event.expectedAudience = parsedAudience
    if (description !== undefined)    event.description   = description
    if (registerLink !== undefined)   event.registerLink  = registerLink
    event.isImportant             = isImportant
    event.registrationNotRequired = registrationNotRequired
    event.registrationOpen        = registrationOpen
    if (assignedFaculty)  event.assignedFaculty  = assignedFaculty
    if (assignedStudents) event.assignedStudents = assignedStudents

    // Non-admin editing an approved event → revert to pending for re-approval
    if (!['admin', 'superadmin'].includes(req.user.role) && event.status === 'approved') {
      event.status     = 'pending'
      event.approvedBy = undefined
      event.approvedAt = undefined
    }

    // Banner image
    const bannerFile      = req?.files?.image?.[0] ?? req?.file
    const oldBannerPublicId = event.imagePublicId
    if (bannerFile) {
      const result         = await uploadToCloudinary(bannerFile.buffer, { folder: 'sca-ems/events' })
      event.imageUrl       = result.secure_url
      event.imagePublicId  = result.public_id
    }

    // Gallery images — append up to 6 total
    const galleryFiles = req?.files?.gallery ?? []
    if (galleryFiles.length > 0) {
      const remaining = 6 - (event.gallery?.length ?? 0)
      if (remaining > 0) {
        const toUpload = galleryFiles.slice(0, remaining)
        const uploaded = await Promise.all(
          toUpload.map(f => uploadToCloudinary(f.buffer, { folder: 'sca-ems/events/gallery' }))
        )
        event.gallery = [...(event.gallery ?? []), ...uploaded.map(r => ({ url: r.secure_url, publicId: r.public_id }))]
      }
    }

    // Remove gallery items flagged for deletion
    if (req.body.removeGalleryIds) {
      let toRemove = []
      try { toRemove = JSON.parse(req.body.removeGalleryIds) } catch { /* ignore */ }
      if (toRemove.length > 0) {
        const kept = (event.gallery ?? []).filter(g => !toRemove.includes(g.publicId))
        // Delete from Cloudinary in background
        Promise.all(toRemove.map(pid => cloudinary.uploader.destroy(pid))).catch(console.error)
        event.gallery = kept
      }
    }

    await event.save()

    // Delete old banner from Cloudinary if replaced
    if (bannerFile && oldBannerPublicId && oldBannerPublicId !== event.imagePublicId) {
      cloudinary.uploader.destroy(oldBannerPublicId).catch(console.error)
    }

    await event.populate('createdBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'))
  } catch (error) {
    console.error('Update event error:', error)
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

    const { facultyId, action } = req.body

    if (action === 'remove') {
      // Remove a single faculty member
      event.assignedFaculty = event.assignedFaculty.filter(
        id => id.toString() !== facultyId
      )
    } else if (facultyId) {
      // Add a single faculty member (avoid duplicates)
      if (!event.assignedFaculty.some(id => id.toString() === facultyId)) {
        event.assignedFaculty.push(facultyId)
      }
    } else if (req.body.facultyIds) {
      // Full replace (backward compat)
      event.assignedFaculty = req.body.facultyIds
    }

    await event.save()
    await event.populate('assignedFaculty', 'firstName lastName department designation')
    await event.populate('assignedStudents', 'firstName lastName registrationNumber')
    await event.populate('createdBy', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, event, 'Faculty updated successfully'))
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
