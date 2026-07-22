import Gallery from '../models/Gallery.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import mongoose from 'mongoose'
import cloudinary from '../config/cloudinary.js'
import { handleEventUpload } from '../config/multer.js'
import Department from '../models/Department.js'

export { handleEventUpload as uploadGalleryFields }

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
        if (error) reject(new ApiError(400, error.message || 'Failed to upload image'))
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

// @desc    Create a new gallery
// @route   POST /api/galleries
// @access  Private/Admin
export const createGallery = async (req, res, next) => {
  try {
    const { title, content, startDate, endDate } = req.body
    let { bannerImage, images } = req.body

    // Handle banner image upload if file is provided
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const uploadResult = await uploadToCloudinary(req.files.image[0].buffer, { folder: 'sca-galleries' })
        bannerImage = uploadResult.secure_url
      } catch (err) {
        console.warn('⚠️ Cloudinary upload failed in createGallery, falling back to base64 Data URL:', err.message)
        const mimeType = req.files.image[0].mimetype || 'image/png'
        const base64Data = req.files.image[0].buffer.toString('base64')
        bannerImage = `data:${mimeType};base64,${base64Data}`
      }
    }

    if (!bannerImage) {
      return next(new ApiError(400, 'Please provide a banner image or upload a file'))
    }

    if (!startDate || !endDate) {
      return next(new ApiError(400, 'Please provide event start and end dates'))
    }

    // Ensure images is an array
    if (typeof images === 'string') {
      images = [images]
    } else if (!images) {
      images = []
    }

    // Filter out empty strings
    images = images.filter(url => url.trim() !== '')

    // Fetch user to get department and hodId
    const User = mongoose.model('User')
    const userDoc = await User.findById(req.user.id).populate('departmentId')

    let initialStatus = 'draft'
    let currentApprover = null
    let departmentId = null
    let departmentCode = ''

    if (['hos', 'superadmin', 'admin'].includes(req.user.role)) {
      initialStatus = 'published'
    } else if (['faculty', 'hod'].includes(req.user.role)) {
      if (!userDoc.departmentId) {
        return next(new ApiError(400, 'You must be assigned to a department to create a gallery.'))
      }
      
      departmentId = userDoc.departmentId._id
      departmentCode = userDoc.departmentId.departmentCode
      
      if (!userDoc.departmentId.hodIds || userDoc.departmentId.hodIds.length === 0) {
        return next(new ApiError(400, 'Your department does not have an assigned HOD. Please contact Admin.'))
      }
      
      initialStatus = 'pending_hod'
      currentApprover = null
    }

    const gallery = await Gallery.create({
      title,
      content, // Changed from description
      startDate,
      endDate,
      bannerImage,
      images,
      facultyId: req.user._id,
      departmentId,
      departmentCode,
      hodId: currentApprover || null,
      currentApprover,
      status: initialStatus,
      createdBy: req.user._id // For backward compatibility
    })

    await gallery.populate('createdBy', 'firstName lastName')

    // Notify HOD if pending_hod
    if (gallery.status === 'pending_hod' && gallery.currentApprover) {
      try {
        const hod = await User.findById(gallery.currentApprover)
        if (hod) {
          const hodEmail = hod.officialEmail || hod.personalEmail
          if (hodEmail) {
            const { sendApprovalStageEmail } = await import('../lib/emailService.js')
            sendApprovalStageEmail({
              to: hodEmail,
              recipientName: `${hod.firstName} ${hod.lastName}`,
              eventTitle: `[Gallery] ${gallery.title}`,
              eventDate: gallery.startDate || new Date(),
              submittedBy: `${gallery.createdBy?.firstName} ${gallery.createdBy?.lastName}`,
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

    res.status(201).json(new ApiResponse(201, gallery, 'Gallery report created successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Get all galleries
// @route   GET /api/galleries
// @access  Public
export const getGalleries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    // Filter by published status for public viewing, unless admin/faculty fetching all (depends on route logic)
    const filter = { status: 'published' }
    
    // Check if user is authenticated and wants their own or admin wants all
    if (req.user && (req.query.all === 'true' || req.query.status)) {
      if (['admin', 'superadmin', 'hos'].includes(req.user.role)) {
        delete filter.status // admin can see all
        if (req.query.status) filter.status = req.query.status
      } else if (req.user.role === 'hod') {
        delete filter.status
        if (req.query.status) {
          filter.status = req.query.status
          if (req.query.status === 'pending_hod') {
            const Department = mongoose.model('Department')
            const depts = await Department.find({ hodIds: req.user._id }).select('_id')
            filter.departmentId = { $in: depts.map(d => d._id) }
          } else {
            filter.facultyId = req.user._id
          }
        } else {
          filter.facultyId = req.user._id
        }
      } else if (req.user.role === 'faculty') {
        delete filter.status
        if (req.query.status) filter.status = req.query.status
        filter.facultyId = req.user._id // faculty sees their own
      }
    }

    const galleries = await Gallery.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Gallery.countDocuments(filter)

    res.status(200).json(new ApiResponse(200, {
      galleries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }, 'Galleries retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Get gallery by ID
// @route   GET /api/galleries/:id
// @access  Public
export const getGalleryById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const gallery = await Gallery.findById(req.params.id).populate('createdBy', 'firstName lastName')
    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    res.status(200).json(new ApiResponse(200, gallery, 'Gallery retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Update gallery
// @route   PUT /api/galleries/:id
// @access  Private/Admin
export const updateGallery = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const { title, content, startDate, endDate } = req.body
    let { bannerImage, images } = req.body

    // Handle banner image upload if file is provided
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const uploadResult = await uploadToCloudinary(req.files.image[0].buffer, { folder: 'sca-galleries' })
        bannerImage = uploadResult.secure_url
      } catch (err) {
        console.warn('⚠️ Cloudinary upload failed in updateGallery, falling back to base64 Data URL:', err.message)
        const mimeType = req.files.image[0].mimetype || 'image/png'
        const base64Data = req.files.image[0].buffer.toString('base64')
        bannerImage = `data:${mimeType};base64,${base64Data}`
      }
    }

    // Ensure images is an array
    if (typeof images === 'string') {
      images = [images]
    } else if (!images) {
      images = undefined
    }

    if (images !== undefined) {
      // Filter out empty strings
      images = images.filter(url => url.trim() !== '')
    }

    const updateData = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (startDate) updateData.startDate = startDate
    if (endDate) updateData.endDate = endDate
    if (bannerImage) updateData.bannerImage = bannerImage
    if (images !== undefined) updateData.images = images

    const gallery = await Gallery.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })

    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    res.status(200).json(new ApiResponse(200, gallery, 'Gallery updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Approve Gallery (HOD -> HOS -> Published)
export const approveGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) throw new ApiError(404, 'Gallery not found')

    const userRole = req.user.role

    // HOD Approval Stage
    if (gallery.status === 'pending_hod') {
      let isAuthorized = false;
      if (['superadmin', 'admin'].includes(userRole)) {
        isAuthorized = true;
      } else if (userRole === 'hod' && gallery.departmentId) {
        const Department = mongoose.model('Department')
        const dept = await Department.findById(gallery.departmentId)
        if (dept && dept.hodIds && dept.hodIds.map(id => id.toString()).includes(req.user.id.toString())) {
          isAuthorized = true;
        }
      }
      if (!isAuthorized) {
        throw new ApiError(403, 'Not authorized to approve at this stage')
      }
      
      gallery.status = 'pending_hos'
      gallery.currentApprover = null // waiting for HOS
      
      await gallery.save()
      
      // Notify HOS
      try {
        const User = mongoose.model('User')
        const hosList = await User.find({ role: { $in: ['hos', 'superadmin'] } })
        if (hosList.length > 0) {
          const { sendApprovalStageEmail } = await import('../lib/emailService.js')
          await gallery.populate('createdBy', 'firstName lastName')
          for (const hos of hosList) {
            const hosEmail = hos.officialEmail || hos.personalEmail
            if (hosEmail) {
              sendApprovalStageEmail({
                to: hosEmail,
                recipientName: `${hos.firstName} ${hos.lastName}`,
                eventTitle: `[Gallery] ${gallery.title}`,
                eventDate: gallery.startDate || new Date(),
                submittedBy: `${gallery.createdBy?.firstName} ${gallery.createdBy?.lastName}`,
                stage: 'Head of School',
                approvedByStage: 'HOD',
                approvalLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hos`
              }).catch(err => console.error('Email error:', err))
            }
          }
        }
      } catch (err) {
        console.error('Failed to notify HOS:', err)
      }

      return res.status(200).json(new ApiResponse(200, gallery, 'Gallery approved by HOD'))
    }
    
    // HOS Approval Stage
    if (gallery.status === 'pending_hos') {
      if (!['hos', 'superadmin'].includes(userRole)) {
        throw new ApiError(403, 'Not authorized to approve at this stage')
      }

      gallery.status = 'published'
      gallery.approvedBy = req.user.id
      gallery.publishedAt = new Date()
      gallery.currentApprover = null

      await gallery.save()
      
      // Notify creator (Faculty)
      try {
        await gallery.populate('createdBy', 'firstName lastName officialEmail personalEmail')
        if (gallery.createdBy) {
          const recipientEmail = gallery.createdBy.officialEmail || gallery.createdBy.personalEmail
          if (recipientEmail) {
            const { sendFinalApprovalEmail } = await import('../lib/emailService.js')
            sendFinalApprovalEmail({
              to: recipientEmail,
              recipientName: `${gallery.createdBy.firstName} ${gallery.createdBy.lastName}`,
              eventTitle: `[Gallery] ${gallery.title}`,
              eventDate: gallery.startDate || new Date(),
              publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/gallery/${gallery._id}`
            }).catch(err => console.error('Email error:', err))
          }
        }
      } catch (err) {
        console.error('Failed to notify creator:', err)
      }

      return res.status(200).json(new ApiResponse(200, gallery, 'Gallery published successfully'))
    }

    throw new ApiError(400, 'Gallery is not pending approval')
  } catch (error) {
    next(error)
  }
}

// Reject Gallery
export const rejectGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) throw new ApiError(404, 'Gallery not found')

    const userRole = req.user.role
    
    let stage = ''
    if (gallery.status === 'pending_hod') stage = 'hod'
    else if (gallery.status === 'pending_hos') stage = 'hos'
    else throw new ApiError(400, 'Gallery is not pending approval')

    // Auth check
    if (stage === 'hod') {
      let isAuthorized = false;
      if (['superadmin', 'admin'].includes(userRole)) {
        isAuthorized = true;
      } else if (userRole === 'hod' && gallery.departmentId) {
        const Department = mongoose.model('Department')
        const dept = await Department.findById(gallery.departmentId)
        if (dept && dept.hodIds && dept.hodIds.map(id => id.toString()).includes(req.user.id.toString())) {
          isAuthorized = true;
        }
      }
      if (!isAuthorized) {
        throw new ApiError(403, 'Not authorized')
      }
    }
    if (stage === 'hos' && !['hos', 'superadmin'].includes(userRole)) {
      throw new ApiError(403, 'Not authorized')
    }

    gallery.status = 'rejected'
    gallery.currentApprover = null

    await gallery.save()

    // Notify creator (Faculty)
    try {
      await gallery.populate('createdBy', 'firstName lastName officialEmail personalEmail')
      if (gallery.createdBy) {
        const recipientEmail = gallery.createdBy.officialEmail || gallery.createdBy.personalEmail
        if (recipientEmail) {
          const { sendRejectionStageEmail } = await import('../lib/emailService.js')
          sendRejectionStageEmail({
            to: recipientEmail,
            recipientName: `${gallery.createdBy.firstName} ${gallery.createdBy.lastName}`,
            eventTitle: `[Gallery] ${gallery.title}`,
            rejectedBy: stage,
            remarks: req.body.remarks || req.body.reason || ''
          }).catch(err => console.error('Email error:', err))
        }
      }
    } catch (err) {
      console.error('Failed to notify creator:', err)
    }

    res.status(200).json(new ApiResponse(200, gallery, 'Gallery rejected successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Delete gallery
// @route   DELETE /api/galleries/:id
// @access  Private/Admin
export const deleteGallery = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const gallery = await Gallery.findById(req.params.id)

    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    await gallery.deleteOne()

    res.status(200).json(new ApiResponse(200, {}, 'Gallery deleted successfully'))
  } catch (error) {
    next(error)
  }
}
