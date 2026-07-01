import jwt from 'jsonwebtoken'
import Joi from 'joi'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

// ── Constants ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Set it in your .env file.')
  process.exit(1)
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// ── Token ─────────────────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

// ── Validation Schemas ────────────────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string().trim().max(254).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('student', 'faculty', 'admin', 'superadmin').optional(),
})

const signupSchema = Joi.object({
  role: Joi.string().valid('student', 'faculty').required(),
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  personalEmail: Joi.string().email().max(254).required(),
  phone: Joi.string().trim().max(20).optional().allow(''),
  password: Joi.string().min(8).max(128).required(),
  // Student fields
  registrationNumber: Joi.when('role', {
    is: 'student',
    then: Joi.string().trim().min(1).max(30).required(),
    otherwise: Joi.string().optional().allow(''),
  }),
  program: Joi.string().trim().max(100).optional().allow(''),
  degree: Joi.string().trim().max(50).optional().allow(''),
  semester: Joi.string().trim().max(10).optional().allow(''),
  section: Joi.string().trim().max(20).optional().allow(''),
  // Faculty fields
  employeeId: Joi.when('role', {
    is: 'faculty',
    then: Joi.string().trim().min(1).max(30).required(),
    otherwise: Joi.string().optional().allow(''),
  }),
  department: Joi.string().trim().max(100).optional().allow(''),
  designation: Joi.string().trim().max(100).optional().allow(''),
  officialEmail: Joi.string().email().max(254).optional().allow(''),
})

const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(128).required(),
})

// ── Helpers ───────────────────────────────────────────────────────────────────
export const buildSignupDuplicateQuery = ({ role, personalEmail, officialEmail, registrationNumber, employeeId }) => {
  const normalizedRole = role?.toLowerCase()
  const conditions = []

  if (personalEmail) conditions.push({ personalEmail: personalEmail.trim().toLowerCase() })
  if (officialEmail) conditions.push({ officialEmail: officialEmail.trim().toLowerCase() })
  if (normalizedRole === 'student' && registrationNumber) {
    conditions.push({ registrationNumber: registrationNumber.trim().toUpperCase() })
  }
  if (normalizedRole === 'faculty' && employeeId) {
    conditions.push({ employeeId: employeeId.trim().toUpperCase() })
  }

  return conditions.length > 0 ? { $or: conditions } : {}
}

// ── Controllers ───────────────────────────────────────────────────────────────
export const signup = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = signupSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map(d => d.message).join('; ')
      throw new ApiError(400, messages)
    }

    const {
      role, firstName, lastName, personalEmail, phone, password,
      registrationNumber, program, degree, semester, section,
      employeeId, department, designation, officialEmail
    } = value

    const duplicateQuery = buildSignupDuplicateQuery({ role, personalEmail, officialEmail, registrationNumber, employeeId })
    const existingUser = Object.keys(duplicateQuery).length > 0
      ? await User.findOne(duplicateQuery)
      : null

    if (existingUser) {
      throw new ApiError(400, 'User with this email or ID already exists')
    }

    const userData = {
      role: role.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.toLowerCase(),
      phone: phone?.trim() || '',
      password,
      isVerified: false,
      isActive: true,
      mustChangePassword: false
    }

    if (role === 'student') {
      userData.registrationNumber = registrationNumber.toUpperCase()
      userData.program = program || ''
      userData.degree = degree || ''
      userData.semester = semester || ''
      userData.section = section || ''
    } else if (role === 'faculty') {
      userData.employeeId = employeeId.toUpperCase()
      userData.department = department || ''
      userData.designation = designation || ''
      if (officialEmail) userData.officialEmail = officialEmail.toLowerCase()
    }

    const user = await User.create(userData)
    const token = generateToken(user._id)

    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json(new ApiResponse(201, { user: userResponse, token }, 'Signup successful'))
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      throw new ApiError(400, 'Invalid email or password format')
    }

    const { email, password, role } = value
    const identifier = email.trim()
    const normalizedEmail = identifier.toLowerCase()
    const normalizedId = identifier.toUpperCase()

    // Find user
    let user
    if (role?.toLowerCase() === 'student') {
      user = await User.findOne({ registrationNumber: normalizedId }).select('+password')
    } else {
      user = await User.findOne({
        $or: [
          { personalEmail: normalizedEmail },
          { officialEmail: normalizedEmail },
          { registrationNumber: normalizedId },
          { employeeId: normalizedId }
        ]
      }).select('+password')
    }

    // Generic error to avoid user enumeration
    if (!user) {
      throw new ApiError(401, 'Invalid credentials')
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Contact administrator.')
    }

    // Check account lockout
    const now = Date.now()
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / 60000)
      throw new ApiError(429, `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`)
    }

    if (user.role !== 'admin' && user.role !== 'superadmin' && !user.isVerified) {
      throw new ApiError(403, 'Account not verified yet. Please wait for admin approval.')
    }

    // Verify password
    const isMatch = user.password ? await user.comparePassword(password) : false

    if (!isMatch) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(now + LOCK_DURATION_MS)
        user.loginAttempts = 0
        await user.save()
        throw new ApiError(429, 'Too many failed attempts. Account locked for 15 minutes.')
      }
      await user.save()
      throw new ApiError(401, 'Invalid credentials')
    }

    // Successful login — reset lockout state
    user.lastLogin = new Date()
    user.loginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    const token = generateToken(user._id)
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json(new ApiResponse(200, { user: userResponse, token }, 'Login successful'))
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, { stripUnknown: true })
    if (error) {
      throw new ApiError(400, 'Password must be at least 8 characters long')
    }

    const { newPassword } = value
    const user = await User.findById(req.user.id).select('+password')
    if (!user) throw new ApiError(404, 'User not found')

    user.password = newPassword
    user.mustChangePassword = false
    user.passwordChangedAt = new Date()
    await user.save()

    const token = generateToken(user._id)
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json(new ApiResponse(200, { user: userResponse, token }, 'Password changed successfully'))
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) throw new ApiError(404, 'User not found')
    res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'))
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
}
