import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import Joi from 'joi'
import passwordGenerator from '../utils/passwordGenerator.js'
import cloudinary from '../config/cloudinary.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new ApiError(400, 'Profile photo must be an image'))
      return
    }
    cb(null, true)
  }
})

// Helper to upload to Cloudinary
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
        if (error) reject(new ApiError(400, error.message || 'Failed to upload profile photo'))
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, verified } = req.query
    const filter = {}
    if (role) filter.role = role
    if (verified === 'true') filter.isVerified = true
    if (verified === 'false') filter.isVerified = false

    const users = await User.find(filter).sort({ createdAt: -1 })
    res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get all students (faculty/admin only)
export const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query
    const filter = { role: 'student', isVerified: true, isActive: true }

    if (search) {
      const regex = new RegExp(search, 'i')
      filter.$or = [
        { registrationNumber: regex },
        { firstName: regex },
        { lastName: regex },
        { officialEmail: regex }
      ]
    }

    const students = await User.find(filter)
      .select('firstName lastName registrationNumber officialEmail')
      .sort({ firstName: 1, lastName: 1 })

    res.status(200).json(new ApiResponse(200, students, 'Students fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get all faculty (admin and faculty)
export const getFaculty = async (req, res, next) => {
  try {
    const { search } = req.query
    const filter = { role: 'faculty', isVerified: true, isActive: true }

    if (search) {
      const regex = new RegExp(search, 'i')
      filter.$or = [
        { employeeId: regex },
        { firstName: regex },
        { lastName: regex },
        { officialEmail: regex }
      ]
    }

    const faculty = await User.find(filter)
      .select('firstName lastName employeeId officialEmail department designation')
      .sort({ firstName: 1, lastName: 1 })

    res.status(200).json(new ApiResponse(200, faculty, 'Faculty fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single user
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Validation schema for admin creating users
const createUserSchema = Joi.object({
  role: Joi.string().valid('student', 'faculty').required(),
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  personalEmail: Joi.string().email().max(254).required(),
  officialEmail: Joi.string().email().max(254).optional().allow(''),
  phone: Joi.string().trim().max(20).optional().allow(''),
  registrationNumber: Joi.string().trim().max(30).optional().allow(''),
  program: Joi.string().trim().max(100).optional().allow(''),
  degree: Joi.string().trim().max(50).optional().allow(''),
  semester: Joi.string().trim().max(10).optional().allow(''),
  section: Joi.string().trim().max(20).optional().allow(''),
  employeeId: Joi.string().trim().max(30).optional().allow(''),
  department: Joi.string().trim().max(100).optional().allow(''),
  designation: Joi.string().trim().max(100).optional().allow(''),
})

// Create user (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map(d => d.message).join('; ')
      throw new ApiError(400, messages)
    }

    const {
      role, firstName, lastName, personalEmail, officialEmail, phone,
      registrationNumber, program, degree, semester, section,
      employeeId, department, designation
    } = value

    const orConditions = [{ personalEmail: personalEmail.toLowerCase() }]
    if (officialEmail) orConditions.push({ officialEmail: officialEmail.toLowerCase() })
    if (registrationNumber) orConditions.push({ registrationNumber: registrationNumber.toUpperCase() })
    if (employeeId) orConditions.push({ employeeId: employeeId.toUpperCase() })

    const existingUser = await User.findOne({ $or: orConditions })
    if (existingUser) {
      throw new ApiError(400, 'User with this email, registration number, or employee ID already exists')
    }

    const tempPassword = passwordGenerator()

    const userData = {
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.toLowerCase(),
      officialEmail: officialEmail?.toLowerCase(),
      phone: phone?.trim() || '',
      password: tempPassword,
      mustChangePassword: true,
      isVerified: true,
    }

    if (role === 'student') {
      userData.registrationNumber = registrationNumber?.toUpperCase()
      userData.program = program || ''
      userData.degree = degree || ''
      userData.semester = semester || ''
      userData.section = section || ''
    } else if (role === 'faculty') {
      userData.employeeId = employeeId?.toUpperCase()
      userData.department = department || ''
      userData.designation = designation || ''
    }

    const user = await User.create(userData)

    // Log temp password server-side only — never return it in the response body
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Temp password for ${personalEmail}: ${tempPassword}`)
    }
    // TODO: send tempPassword via email using nodemailer

    res.status(201).json(new ApiResponse(201, { user }, 'User created successfully. Temporary password has been generated.'))
  } catch (error) {
    next(error)
  }
}

// Update user profile (self)
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    // Whitelist only allowed fields per role — never trust raw req.body keys
    const commonFields = ['firstName', 'lastName', 'personalEmail', 'phone']
    const studentFields = ['program', 'degree', 'semester', 'section']
    const facultyFields = ['department', 'designation']

    const allowedFields = [
      ...commonFields,
      ...(user.role === 'student' ? studentFields : []),
      ...(user.role === 'faculty' || user.role === 'admin' || user.role === 'superadmin' ? facultyFields : []),
    ]

    const sanitized = {}
    for (const field of allowedFields) {
      // With multipart/form-data (multer), all appended fields appear in req.body
      // Use hasOwnProperty but also accept empty string (user clearing a field)
      const val = req.body[field]
      if (val !== undefined) {
        sanitized[field] = typeof val === 'string' ? val.trim() : val
      }
    }

    // Validate
    const profileSchema = Joi.object({
      firstName:     Joi.string().trim().min(1).max(50).optional(),
      lastName:      Joi.string().trim().min(1).max(50).optional(),
      personalEmail: Joi.string().email().max(254).optional(),
      phone:         Joi.string().trim().max(20).optional().allow(''),
      // Student fields
      program:       Joi.string().trim().max(100).optional().allow(''),
      degree:        Joi.string().trim().max(50).optional().allow(''),
      semester:      Joi.string().trim().max(20).optional().allow(''),
      section:       Joi.string().trim().max(20).optional().allow(''),
      // Faculty fields
      department:    Joi.string().trim().max(100).optional().allow(''),
      designation:   Joi.string().trim().max(100).optional().allow(''),
    })
    const { error, value } = profileSchema.validate(sanitized, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map(d => d.message).join('; ')
      throw new ApiError(400, messages)
    }

    // Apply common fields
    if (value.firstName)                  user.firstName     = value.firstName
    if (value.lastName !== undefined)     user.lastName      = value.lastName || 'User'
    if (value.personalEmail)              user.personalEmail = value.personalEmail.toLowerCase()
    if (value.phone !== undefined)        user.phone         = value.phone

    // Apply student-specific fields
    if (user.role === 'student') {
      if (value.program !== undefined)   user.program  = value.program
      if (value.degree !== undefined)    user.degree   = value.degree
      if (value.semester !== undefined)  user.semester = value.semester
      if (value.section !== undefined)   user.section  = value.section
    }

    // Apply faculty/admin fields
    if (['faculty', 'admin', 'superadmin'].includes(user.role)) {
      if (value.department !== undefined)  user.department  = value.department
      if (value.designation !== undefined) user.designation = value.designation
    }

    if (!user.lastName) user.lastName = 'User'

    let oldProfilePhotoPublicId

    // Handle profile photo upload
    if (req.file) {
      oldProfilePhotoPublicId = user.profilePhotoPublicId
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'sca-ems/profiles',
        public_id: `profile_${user._id}`,
        overwrite: true,
        invalidate: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })
      user.profilePhotoUrl = result.secure_url
      user.profilePhotoPublicId = result.public_id
    }

    await user.save()

    if (oldProfilePhotoPublicId && oldProfilePhotoPublicId !== user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(oldProfilePhotoPublicId)
    }

    res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Update user (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const {
      firstName,
      lastName,
      personalEmail,
      officialEmail,
      phone,
      isActive,
      registrationNumber,
      program,
      degree,
      semester,
      section,
      employeeId,
      department,
      designation
    } = req.body

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (personalEmail) user.personalEmail = personalEmail
    if (officialEmail) user.officialEmail = officialEmail
    if (phone) user.phone = phone
    if (typeof isActive === 'boolean') user.isActive = isActive

    if (user.role === 'student') {
      if (registrationNumber) user.registrationNumber = registrationNumber.toUpperCase()
      if (program) user.program = program
      if (degree) user.degree = degree
      if (semester) user.semester = semester
      if (section) user.section = section
    } else if (user.role === 'faculty') {
      if (employeeId) user.employeeId = employeeId.toUpperCase()
      if (department) user.department = department
      if (designation) user.designation = designation
    }

    await user.save()

    res.status(200).json(new ApiResponse(200, user, 'User updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    // Delete profile photo from Cloudinary if exists
    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId)
    }

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'))
  } catch (error) {
    next(error)
  }
}

// Get stats for admin dashboard
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalFaculty = await User.countDocuments({ role: 'faculty' })
    const totalStudents = await User.countDocuments({ role: 'student' })

    res.status(200).json(new ApiResponse(200, { totalUsers, totalFaculty, totalStudents }, 'Stats fetched successfully'))
  } catch (error) {
    next(error)
  }
}

export { upload }
