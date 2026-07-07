import VerificationApplication from '../models/VerificationApplication.js'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import generateRefNumber from '../utils/generateRefNumber.js'
import cloudinary from '../config/cloudinary.js'
import multer from 'multer'
import { sendMail } from '../utils/mailer.js'
import { verificationApprovedTemplate, verificationRejectedTemplate } from '../utils/emailTemplates.js'

const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

// Submit verification application
export const submitApplication = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    // Check if user already has pending application
    const existingApplication = await VerificationApplication.findOne({
      user: user._id,
      status: 'pending'
    })

    if (existingApplication) {
      throw new ApiError(400, 'You already have a pending verification application')
    }

    const referenceNumber = generateRefNumber()

    const applicationData = {
      user: user._id,
      referenceNumber
    }

    // Upload files
    if (req.files) {
      if (req.files.universityId) {
        const result = await uploadToCloudinary(req.files.universityId[0].buffer, 'sca-verification')
        applicationData.universityIdUrl = result.secure_url
        applicationData.universityIdPublicId = result.public_id
      }

      if (req.files.profilePhoto) {
        const result = await uploadToCloudinary(req.files.profilePhoto[0].buffer, 'sca-verification')
        applicationData.profilePhotoUrl = result.secure_url
        applicationData.profilePhotoPublicId = result.public_id
      }
    }

    const application = await VerificationApplication.create(applicationData)

    res.status(201).json(new ApiResponse(201, application, 'Application submitted successfully'))
  } catch (error) {
    next(error)
  }
}

// Get my application status
export const getMyApplication = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findOne({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName role')
      .populate('reviewedBy', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, application, 'Application fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get all applications (admin only)
export const getAllApplications = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status) filter.status = status

    const applications = await VerificationApplication.find(filter)
      .populate('user', 'firstName lastName role registrationNumber employeeId')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    const validApplications = applications.filter(app => app.user !== null);

    res.status(200).json(new ApiResponse(200, validApplications, 'Applications fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single application
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findById(req.params.id)
      .populate('user')
      .populate('reviewedBy', 'firstName lastName')

    if (!application) {
      throw new ApiError(404, 'Application not found')
    }

    res.status(200).json(new ApiResponse(200, application, 'Application fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Approve application (admin only)
export const approveApplication = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findById(req.params.id)
      .populate('user')

    if (!application) {
      throw new ApiError(404, 'Application not found')
    }

    const { adminNotes, checklist } = req.body

    application.status = 'approved'
    application.reviewedBy = req.user.id
    application.reviewedAt = new Date()
    if (adminNotes) application.adminNotes = adminNotes
    if (checklist) application.checklist = checklist

    // Mark user as verified
    const user = await User.findById(application.user._id)
    user.isVerified = true
    await user.save()

    await application.save()
    await application.populate('reviewedBy', 'firstName lastName')

    // Send email
    const html = verificationApprovedTemplate({
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
    });

    sendMail({
      to: user.personalEmail,
      subject: 'Account Verification Approved — SCA Portal',
      html,
    }).catch(err => console.error('Failed to send verification approval email:', err));

    res.status(200).json(new ApiResponse(200, application, 'Application approved successfully'))
  } catch (error) {
    next(error)
  }
}

// Reject application (admin only)
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findById(req.params.id)
      .populate('user')
    if (!application) {
      throw new ApiError(404, 'Application not found')
    }

    const { rejectionReason, adminNotes, checklist } = req.body

    application.status = 'rejected'
    application.reviewedBy = req.user.id
    application.reviewedAt = new Date()
    application.rejectionReason = rejectionReason
    if (adminNotes) application.adminNotes = adminNotes
    if (checklist) application.checklist = checklist

    await application.save()
    await application.populate('reviewedBy', 'firstName lastName')

    const user = application.user;

    // Send email
    const html = verificationRejectedTemplate({
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
      reason: rejectionReason || adminNotes || '',
    });

    sendMail({
      to: user.personalEmail,
      subject: 'Account Verification Rejected — SCA Portal',
      html,
    }).catch(err => console.error('Failed to send verification rejection email:', err));

    res.status(200).json(new ApiResponse(200, application, 'Application rejected successfully'))
  } catch (error) {
    next(error)
  }
}

export { upload }
