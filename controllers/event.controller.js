import Event from '../models/Event.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import cloudinary from '../config/cloudinary.js'
import { handleEventUpload } from '../config/multer.js'
import mongoose from 'mongoose'
import Department from '../models/Department.js'

// Helper to find event by either ID or slug
const findEventByIdOrSlug = async (identifier) => {
  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Event.findById(identifier)
  }
  // Otherwise, try by slug
  return await Event.findOne({ slug: identifier })
}

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
    } else if (req.user.role === 'hod') {
      const Department = mongoose.model('Department')
      const depts = await Department.find({ hodIds: req.user.id }).select('_id')
      filter.$or = [
        { departmentId: { $in: depts.map(d => d._id) } },
        { createdBy: req.user.id },
        { assignedFaculty: req.user.id }
      ]
    }
    // Admins and superadmins see all events

    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('assignedFaculty', 'firstName lastName')
      .populate('assignedStudents', 'firstName lastName')
      .sort({ startDate: -1 })

    res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get approved events for public landing page — latest first, exclude completed and past events
export const getApprovedEvents = async (req, res, next) => {
  try {
    const today = new Date()
    // Set time to 00:00:00 to include today's events
    today.setHours(0, 0, 0, 0)

    const events = await Event.find({ 
      status: 'published',
      startDate: { $gte: today } // Only events on or after today
    })
      .sort({ startDate: 1, createdAt: -1 }) // Sort by upcoming date first, then latest created
      .select('title type startDate endDate time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery externalImageUrls isImportant slug')
      .populate('assignedFaculty', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, events, 'Approved events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get all public events (including past and completed) — for public events page
export const getAllPublicEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ 
      status: { $in: ['published', 'completed'] }
    })
      .sort({ startDate: -1, createdAt: -1 }) // Sort by latest date first
      .select('title type startDate endDate time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery externalImageUrls isImportant status slug')
      .populate('assignedFaculty', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, events, 'All public events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single approved or completed event for public detail page (no auth) — accepts ID or slug
export const getPublicEventById = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)

    if (!event || !['published', 'completed'].includes(event.status)) {
      throw new ApiError(404, 'Event not found')
    }

    // Select the fields we need
    const eventResponse = {
      _id: event._id,
      slug: event.slug,
      title: event.title,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      venue: event.venue,
      description: event.description,
      imageUrl: event.imageUrl,
      registerLink: event.registerLink,
      registrationNotRequired: event.registrationNotRequired,
      registrationOpen: event.registrationOpen,
      gallery: event.gallery,
      externalImageUrls: event.externalImageUrls,
      isImportant: event.isImportant,
      status: event.status,
      assignedFaculty: event.assignedFaculty
    }

    // Populate assigned faculty
    if (event.assignedFaculty.length > 0) {
      await event.populate('assignedFaculty', 'firstName lastName')
      eventResponse.assignedFaculty = event.assignedFaculty
    }

    res.status(200).json(new ApiResponse(200, eventResponse, 'Event fetched'))
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
      .sort({ startDate: -1 })

    res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single event (role-based check) — accepts ID or slug
export const getEventById = async (req, res, next) => {
  try {
    const identifier = req.params.id
    let event = await findEventByIdOrSlug(identifier)

    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    // Populate all required fields
    await event.populate('createdBy', 'firstName lastName')
    await event.populate('approvedBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')
    await event.populate('assignedStudents', 'firstName lastName')

    // Check if user is authorized to view this event
    const userId = req.user.id.toString()
    const creatorId = event.createdBy
      ? (event.createdBy._id ?? event.createdBy).toString()
      : null

    let isHodAuthorized = false
    if (req.user.role === 'hod') {
      const Department = mongoose.model('Department')
      const depts = await Department.find({ hodIds: req.user._id }).select('_id')
      const deptIds = depts.map(d => d._id.toString())
      console.log('DEBUG HOD AUTH:')
      console.log('req.user._id:', req.user._id)
      console.log('depts found:', deptIds)
      console.log('event.departmentId:', event.departmentId)
      if (event.departmentId && deptIds.includes(event.departmentId.toString())) {
        isHodAuthorized = true
      }
      console.log('isHodAuthorized evaluates to:', isHodAuthorized)
    }

    const isAuthorized = 
      // Admin/superadmin/dean/hos can see all
      ['admin', 'superadmin', 'dean', 'hos'].includes(req.user.role) ||
      // HOD can see if it belongs to their department
      isHodAuthorized ||
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
      title, type, startDate, endDate, time, startTime, endTime, venue, expectedAudience,
      description, registerLink, assignedStudents = [], externalImageUrls = []
    } = req.body

    // Validate required fields first
    if (!title || !type || !startDate || !endDate || !venue) {
      return next(new ApiError(400, 'Missing required fields: title, type, startDate, endDate, venue'))
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

    // Parse and validate external image URLs
    let parsedExternalUrls = []
    if (externalImageUrls) {
      try {
        parsedExternalUrls = typeof externalImageUrls === 'string'
          ? JSON.parse(externalImageUrls)
          : externalImageUrls
        console.log('Parsed external image URLs (create):', parsedExternalUrls)
        // Filter out any empty/whitespace-only URLs and limit to 10
        parsedExternalUrls = parsedExternalUrls
          .filter(url => typeof url === 'string' && url.trim().length > 0)
          .slice(0, 10)
      } catch { parsedExternalUrls = [] }
    }

    // Fetch user to get department and hodId
    const User = mongoose.model('User')
    const userDoc = await User.findById(req.user.id).populate('departmentId')
    
    let initialStatus = 'draft' // or pending_admin if admin created it
    let currentApprover = null
    let departmentId = null
    let departmentCode = ''

    if (['admin', 'superadmin'].includes(req.user.role)) {
      initialStatus = 'published'
    } else if (req.user.role === 'faculty') {
      if (!userDoc.departmentId) {
        return next(new ApiError(400, 'You must be assigned to a department to create an event.'))
      }
      
      departmentId = userDoc.departmentId._id
      departmentCode = userDoc.departmentId.departmentCode
      
      if (!userDoc.departmentId.hodIds || userDoc.departmentId.hodIds.length === 0) {
        return next(new ApiError(400, 'Your department does not have an assigned HOD. Please contact Admin.'))
      }
      
      initialStatus = 'pending_hod'
      // currentApprover is not strictly needed since any HOD can approve
      currentApprover = null
    }

    const eventData = {
      title, type, startDate, endDate, time, startTime, endTime, venue,
      expectedAudience: parsedAudience,
      description, registerLink,
      registrationNotRequired, registrationOpen, isImportant,
      status: initialStatus,
      departmentId,
      departmentCode,
      currentApprover,
      eventType: req.body.eventType || 'regular',
      clubId: req.body.clubId || null,
      createdBy: req.user.id,
      assignedFaculty, assignedStudents,
      gallery: [], // Initialize empty to prevent undefined issues
      externalImageUrls: parsedExternalUrls
    }

    // Banner image
    const bannerFile = req?.files?.image?.[0] ?? req?.file
    if (bannerFile) {
      try {
        const result = await uploadToCloudinary(bannerFile.buffer, { folder: 'sca-ems/events' })
        eventData.imageUrl      = result.secure_url
        eventData.imagePublicId = result.public_id
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary banner upload failed in createEvent, falling back to base64 Data URL:', uploadErr.message)
        const mimeType = bannerFile.mimetype || 'image/png'
        const base64Data = bannerFile.buffer.toString('base64')
        eventData.imageUrl = `data:${mimeType};base64,${base64Data}`
        eventData.imagePublicId = `fallback_${Date.now()}`
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
        console.warn('⚠️ Cloudinary gallery upload failed in createEvent, falling back to base64 Data URLs:', uploadErr.message)
        eventData.gallery = galleryFiles.map((f, i) => {
          const mimeType = f.mimetype || 'image/png'
          const base64Data = f.buffer.toString('base64')
          return {
            url: `data:${mimeType};base64,${base64Data}`,
            publicId: `fallback_gal_${Date.now()}_${i}`
          }
        })
      }
    }

    const event = await Event.create(eventData)
    console.log('Created event:', event)
    await event.populate('createdBy', 'firstName lastName')
    await event.populate('assignedFaculty', 'firstName lastName')

    // Notify HOD if pending_hod
    if (event.status === 'pending_hod' && event.currentApprover) {
      try {
        const hod = await User.findById(event.currentApprover)
        if (hod) {
          const hodEmail = hod.officialEmail || hod.personalEmail
          if (hodEmail) {
            const { sendApprovalStageEmail } = await import('../lib/emailService.js')
            sendApprovalStageEmail({
              to: hodEmail,
              recipientName: `${hod.firstName} ${hod.lastName}`,
              eventTitle: event.title,
              eventDate: event.date || event.startDate,
              submittedBy: `${event.createdBy?.firstName} ${event.createdBy?.lastName}`,
              stage: 'Head of Department',
              approvedByStage: 'Faculty',
              approvalLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hod`
            }).catch(err => console.error('Email error:', err))
          }
        }
      } catch (err) {
        console.error('Failed to notify HOD:', err)
      }
    }

    res.status(201).json(new ApiResponse(201, event, 'Event created successfully'))
  } catch (error) {
    console.error('Create event error:', error)
    next(error)
  }
}

// Update event — accepts ID or slug
export const updateEvent = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
    if (!event) throw new ApiError(404, 'Event not found')

    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to update this event')
    }

    const { title, type, startDate, endDate, time, startTime, endTime, venue, expectedAudience, description, registerLink, assignedFaculty, assignedStudents, externalImageUrls } = req.body
    const isImportant           = req.body.isImportant           === 'true' || req.body.isImportant           === true
    const registrationNotRequired = req.body.registrationNotRequired === 'true' || req.body.registrationNotRequired === true
    const registrationOpen      = req.body.registrationOpen      === 'true' || req.body.registrationOpen      === true
    const parsedAudience        = expectedAudience ? Number(expectedAudience) : undefined

    if (title)                    event.title             = title
    if (type)                     event.type              = type
    if (startDate)                event.startDate         = startDate
    if (endDate)                  event.endDate           = endDate
    if (time !== undefined)       event.time              = time
    if (startTime !== undefined)  event.startTime         = startTime
    if (endTime !== undefined)    event.endTime           = endTime
    if (venue)                    event.venue             = venue
    if (parsedAudience !== undefined) event.expectedAudience = parsedAudience
    if (description !== undefined)    event.description   = description
    if (registerLink !== undefined)   event.registerLink  = registerLink
    event.isImportant             = isImportant
    event.registrationNotRequired = registrationNotRequired
    event.registrationOpen        = registrationOpen
    if (assignedFaculty)  event.assignedFaculty  = assignedFaculty
    if (assignedStudents) event.assignedStudents = assignedStudents

    // Handle external image URLs: always set it (even if not provided)
    let parsedExternalUrls = []
    if (externalImageUrls !== undefined) {
      try {
        parsedExternalUrls = typeof externalImageUrls === 'string'
          ? JSON.parse(externalImageUrls)
          : externalImageUrls
        console.log('Parsed external image URLs (update):', parsedExternalUrls)
        // Filter out any empty/whitespace-only URLs and limit to 10
        parsedExternalUrls = parsedExternalUrls
          .filter(url => typeof url === 'string' && url.trim().length > 0)
          .slice(0, 10)
      } catch { parsedExternalUrls = [] }
    }
    // Set it to the parsed value or the existing one (or empty array if neither)
    event.externalImageUrls = parsedExternalUrls.length > 0 
      ? parsedExternalUrls 
      : (event.externalImageUrls || [])

    // Non-admin editing a published/pending event → revert to pending for re-approval
    if (!['admin', 'superadmin'].includes(req.user.role) && ['published', 'pending_admin'].includes(event.status)) {
      const User = mongoose.model('User')
      const userDoc = await User.findById(req.user.id)
      
      event.status = 'pending_hod'
      event.currentApprover = undefined
      event.isPublished = false
      event.approvedBy = undefined
      event.approvedAt = undefined

      // Notify HOD about re-approval
      if (userDoc.hodId) {
        try {
          const hod = await User.findById(userDoc.hodId)
          if (hod) {
            const hodEmail = hod.officialEmail || hod.personalEmail
            if (hodEmail) {
              const { sendApprovalStageEmail } = await import('../lib/emailService.js')
              sendApprovalStageEmail({
                to: hodEmail,
                recipientName: `${hod.firstName} ${hod.lastName}`,
                eventTitle: event.title || 'Updated Event',
                eventDate: event.date || event.startDate || new Date(),
                submittedBy: `${userDoc.firstName} ${userDoc.lastName}`,
                stage: 'Head of Department',
                approvedByStage: 'Faculty (Update)',
                approvalLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hod`
              }).catch(err => console.error('Email error:', err))
            }
          }
        } catch (err) {
          console.error('Failed to notify HOD on update:', err)
        }
      }
    }

    // Banner image
    const bannerFile      = req?.files?.image?.[0] ?? req?.file
    const oldBannerPublicId = event.imagePublicId
    if (bannerFile) {
      try {
        const result         = await uploadToCloudinary(bannerFile.buffer, { folder: 'sca-ems/events' })
        event.imageUrl       = result.secure_url
        event.imagePublicId  = result.public_id
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary banner upload failed in updateEvent, falling back to base64 Data URL:', uploadErr.message)
        const mimeType = bannerFile.mimetype || 'image/png'
        const base64Data = bannerFile.buffer.toString('base64')
        event.imageUrl = `data:${mimeType};base64,${base64Data}`
        event.imagePublicId = `fallback_${Date.now()}`
      }
    }

    // Gallery images — append up to 6 total
    const galleryFiles = req?.files?.gallery ?? []
    if (galleryFiles.length > 0) {
      const remaining = 6 - (event.gallery?.length ?? 0)
      if (remaining > 0) {
        const toUpload = galleryFiles.slice(0, remaining)
        try {
          const uploaded = await Promise.all(
            toUpload.map(f => uploadToCloudinary(f.buffer, { folder: 'sca-ems/events/gallery' }))
          )
          event.gallery = [...(event.gallery ?? []), ...uploaded.map(r => ({ url: r.secure_url, publicId: r.public_id }))]
        } catch (uploadErr) {
          console.warn('⚠️ Cloudinary gallery upload failed in updateEvent, falling back to base64 Data URLs:', uploadErr.message)
          const fallbackGallery = toUpload.map((f, i) => {
            const mimeType = f.mimetype || 'image/png'
            const base64Data = f.buffer.toString('base64')
            return {
              url: `data:${mimeType};base64,${base64Data}`,
              publicId: `fallback_gal_${Date.now()}_${i}`
            }
          })
          event.gallery = [...(event.gallery ?? []), ...fallbackGallery]
        }
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
    console.log('Updated event:', event)

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

// Approve event (HOD -> Admin -> Published)
export const approveEvent = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const { remarks } = req.body
    const userRole = req.user.role

    // HOD Approval Stage
    if (event.status === 'pending_hod') {
      let isAuthorized = false;
      if (['superadmin', 'admin'].includes(userRole)) {
        isAuthorized = true;
      } else if (userRole === 'hod' && event.departmentId) {
        const Department = mongoose.model('Department')
        const dept = await Department.findById(event.departmentId)
        if (dept && dept.hodIds && dept.hodIds.map(id => id.toString()).includes(req.user.id.toString())) {
          isAuthorized = true;
        }
      }
      
      if (!isAuthorized) {
        throw new ApiError(403, 'Not authorized to approve at this stage. You must be an assigned HOD for this department.')
      }
      
      event.status = 'pending_admin'
      event.currentApprover = null // Now waiting for any admin
      event.approvalChain.push({
        stage: 'hod',
        action: 'approved',
        actionBy: req.user.id,
        actionByName: `${req.user.firstName} ${req.user.lastName}`,
        actionByRole: req.user.role,
        remarks: remarks || ''
      })
      
      await event.save()
      
      // Notify Admin
      try {
        const User = mongoose.model('User')
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
        if (admins.length > 0) {
          const { sendApprovalStageEmail } = await import('../lib/emailService.js')
          await event.populate('createdBy', 'firstName lastName')
          for (const admin of admins) {
            const adminEmail = admin.officialEmail || admin.personalEmail
            if (adminEmail) {
              sendApprovalStageEmail({
                to: adminEmail,
                recipientName: `${admin.firstName} ${admin.lastName}`,
                eventTitle: event.title,
                eventDate: event.date || event.startDate,
                submittedBy: `${event.createdBy?.firstName} ${event.createdBy?.lastName}`,
                stage: 'Admin',
                approvedByStage: 'HOD',
                approvalLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`
              }).catch(err => console.error('Email error:', err))
            }
          }
        }
      } catch (err) {
        console.error('Failed to notify admins:', err)
      }

      return res.status(200).json(new ApiResponse(200, event, 'Event approved by HOD successfully'))
    }
    
    // Admin Approval Stage
    if (event.status === 'pending_admin') {
      if (!['admin', 'superadmin'].includes(userRole)) {
        throw new ApiError(403, 'Not authorized to approve at this stage')
      }

      event.status = 'published'
      event.isPublished = true
      // NOTE: registrationOpen remains untouched, controlled independently.
      
      event.approvedBy = req.user.id
      event.approvedAt = new Date()
      event.currentApprover = null
      
      event.approvalChain.push({
        stage: 'admin',
        action: 'approved',
        actionBy: req.user.id,
        actionByName: `${req.user.firstName} ${req.user.lastName}`,
        actionByRole: req.user.role,
        remarks: remarks || ''
      })

      await event.save()
      await event.populate('createdBy', 'firstName lastName officialEmail personalEmail')
      
      // Send notification to creator
      if (event.createdBy) {
        const recipientEmail = event.createdBy.officialEmail || event.createdBy.personalEmail
        if (recipientEmail) {
          const { sendFinalApprovalEmail } = await import('../lib/emailService.js')
          sendFinalApprovalEmail({
            to: recipientEmail,
            recipientName: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
            eventTitle: event.title,
            eventDate: event.date,
            publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event.slug}`
          }).catch(err => console.error('Email error:', err))
        }
      }

      return res.status(200).json(new ApiResponse(200, event, 'Event published successfully'))
    }

    throw new ApiError(400, 'Event is not pending approval')
  } catch (error) {
    next(error)
  }
}

// Reject event
export const rejectEvent = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    const { reason } = req.body
    const userRole = req.user.role
    
    let stage = ''
    if (event.status === 'pending_hod') stage = 'hod'
    else if (event.status === 'pending_admin') stage = 'admin'
    else throw new ApiError(400, 'Event is not in a pending state')

    // Auth check
    if (stage === 'hod') {
      let isAuthorized = false;
      if (['superadmin', 'admin'].includes(userRole)) {
        isAuthorized = true;
      } else if (userRole === 'hod' && event.departmentId) {
        const Department = mongoose.model('Department')
        const dept = await Department.findById(event.departmentId)
        if (dept && dept.hodIds && dept.hodIds.map(id => id.toString()).includes(req.user.id.toString())) {
          isAuthorized = true;
        }
      }
      if (!isAuthorized) {
        throw new ApiError(403, 'Not authorized')
      }
    }
    if (stage === 'admin' && !['admin', 'superadmin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized')
    }

    event.status = 'rejected'
    event.rejectedReason = reason
    event.currentApprover = null
    
    event.approvalChain.push({
      stage,
      action: 'rejected',
      actionBy: req.user.id,
      actionByName: `${req.user.firstName} ${req.user.lastName}`,
      actionByRole: req.user.role,
      remarks: reason || ''
    })

    await event.save()
    await event.populate('createdBy', 'firstName lastName officialEmail personalEmail')

    // Send notification
    if (event.createdBy) {
      const recipientEmail = event.createdBy.officialEmail || event.createdBy.personalEmail
      if (recipientEmail) {
        const { sendRejectionStageEmail } = await import('../lib/emailService.js')
        sendRejectionStageEmail({
          to: recipientEmail,
          recipientName: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
          eventTitle: event.title,
          rejectedBy: stage,
          remarks: reason
        }).catch(err => console.error('Email error:', err))
      }
    }

    res.status(200).json(new ApiResponse(200, event, 'Event rejected successfully'))
  } catch (error) {
    next(error)
  }
}

// Toggle Registration (Admin only)
export const toggleRegistration = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Only admins can toggle registration')
    }
    
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
    if (!event) throw new ApiError(404, 'Event not found')
    
    event.registrationOpen = !event.registrationOpen
    await event.save()
    
    res.status(200).json(new ApiResponse(200, event, `Registration is now ${event.registrationOpen ? 'open' : 'closed'}`))
  } catch (error) {
    next(error)
  }
}

// Delete event — accepts ID or slug
export const deleteEvent = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
    if (!event) {
      throw new ApiError(404, 'Event not found')
    }

    // Check if user is owner or admin
    if (event.createdBy.toString() !== req.user.id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to delete this event')
    }

    await Event.findByIdAndDelete(event._id)

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
    const pendingEvents = await Event.countDocuments({ ...statsFilter, status: { $in: ['pending_hod', 'pending_admin'] } })
    const approvedEvents = await Event.countDocuments({ ...statsFilter, status: 'published' })
    const completedEvents = await Event.countDocuments({ ...statsFilter, status: 'completed' })

    res.status(200).json(new ApiResponse(200, { totalEvents, pendingEvents, approvedEvents, completedEvents }, 'Stats fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark event as completed — accepts ID or slug
export const completeEvent = async (req, res, next) => {
  try {
    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
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

// Assign faculty to event — accepts ID or slug
export const assignFaculty = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to assign faculty')
    }

    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
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

// Assign students to event — accepts ID or slug
export const assignStudents = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin', 'faculty'].includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to assign students')
    }

    const identifier = req.params.id
    const event = await findEventByIdOrSlug(identifier)
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
