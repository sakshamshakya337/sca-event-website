import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Joi from 'joi'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import { sendMail } from '../utils/mailer.js'
import { resetPasswordTemplate } from '../utils/emailTemplates.js'
import { verifyHCaptcha } from '../utils/hcaptcha.js'

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

export const deleteOwnAccount = async (req, res, next) => {
  try {
    // Only allow deletion of accounts that have NOT yet been verified
    // (i.e. freshly created during signup flow that failed mid-way)
    const user = await User.findById(req.user.id)
    if (!user) throw new ApiError(404, 'User not found')

    if (user.isVerified) {
      throw new ApiError(403, 'Cannot delete a verified account via this endpoint.')
    }

    await User.findByIdAndDelete(req.user.id)
    res.status(200).json(new ApiResponse(200, null, 'Account deleted.'))
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
}


const hashValue = (value) =>
  crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')

// ── Validation schemas for password reset ────────────────────────────────────
const forgotSchema = Joi.object({
  identifier: Joi.string().trim().min(2).max(50).required(), // reg number or employee ID
  role: Joi.string().valid('student', 'faculty').required(),
  securityAnswer: Joi.string().trim().min(1).max(200).required(),
  hcaptchaToken: Joi.string().required(), // hCaptcha widget token
})

const resetSchema = Joi.object({
  token: Joi.string().length(64).hex().required(), // 32-byte hex token
  newPassword: Joi.string().min(8).max(128).required(),
})

const verifyTokenSchema = Joi.object({
  token: Joi.string().length(64).hex().required(),
})

// ── Step 1: Verify identity + security answer → return token for frontend ────
// The frontend will use the token to call EmailJS and send the reset link.
// The token itself is stored as a hash server-side (never returned in plain form
// for email — the frontend receives the plain token to embed in the reset URL).
export const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, error.details[0].message)

    const { identifier, role, securityAnswer, hcaptchaToken } = value

    // ── hCaptcha check first (cheap, rejects bots before any DB work) ──
    const captcha = await verifyHCaptcha(hcaptchaToken, req.ip)
    if (!captcha.success) {
      throw new ApiError(400, 'Captcha verification failed. Please try again.')
    }

    // Try both the raw value and uppercased — handle any stored format
    const normalizedId = identifier.trim().toUpperCase()
    const rawId = identifier.trim()

    // Step 1: Find the user document ID using registration/employee number
    let userId = null
    if (role === 'student') {
      const found = await User.findOne({
        role: 'student',
        registrationNumber: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('_id isActive')
      if (!found && normalizedId !== rawId) {
        const found2 = await User.findOne({ role: 'student', registrationNumber: normalizedId }).select('_id isActive')
        if (found2) { userId = found2._id; }
        else userId = null
      } else if (found) {
        userId = found._id
        if (found.isActive === false) throw new ApiError(403, 'Account deactivated.')
      }
    } else {
      const found = await User.findOne({
        role: 'faculty',
        employeeId: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('_id isActive')
      if (!found && normalizedId !== rawId) {
        const found2 = await User.findOne({ role: 'faculty', employeeId: normalizedId }).select('_id isActive')
        if (found2) userId = found2._id
        else userId = null
      } else if (found) {
        userId = found._id
        if (found.isActive === false) throw new ApiError(403, 'Account deactivated.')
      }
    }

    if (!userId) {
      throw new ApiError(404, 'No account found with that ID. Please check your registration number.')
    }

    // Step 2: Use raw collection access to bypass Mongoose select:false restrictions
    // This guarantees securityQuestion and securityAnswer are returned regardless of schema defaults
    const userDoc = await User.collection.findOne({ _id: userId })

    if (!userDoc) {
      throw new ApiError(404, 'No account found with that ID.')
    }
    if (userDoc.isActive === false) {
      throw new ApiError(403, 'This account has been deactivated. Contact your administrator.')
    }

    if (!userDoc.securityQuestion || !userDoc.securityAnswer) {
      throw new ApiError(400, 'No security question set for this account. Please set one in your profile settings first.')
    }

    // Verify security answer (case-insensitive hash comparison)
    const answerHash = hashValue(securityAnswer)
    if (answerHash !== userDoc.securityAnswer) {
      throw new ApiError(401, 'Incorrect security answer.')
    }

    // Generate a cryptographically secure 32-byte token
    const plainToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = hashValue(plainToken)

    // Store hashed token with 15-minute expiry — use Mongoose model for this
    await User.updateOne({ _id: userId }, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000)
    })

    // Build reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${frontendUrl}/forgot-password?token=${plainToken}&step=3`

    // Mask the email for the response
    const maskedEmail = userDoc.personalEmail.replace(/(.{2}).+(@.+)/, '$1***$2')

    // Respond immediately — the SMTP round-trip is the slow part, so we send
    // the email in the background (fire-and-forget) and never block the user.
    res.status(200).json(new ApiResponse(200, {
      maskedEmail,
    }, 'Identity verified. A reset link has been sent to your email.'))

    const html = resetPasswordTemplate({
      name: userDoc.firstName,
      resetLink,
    })

    sendMail({
      to: userDoc.personalEmail,
      subject: 'Password Reset Request — SCA Portal',
      html,
    }).catch((err) => {
      console.error('❌ Async reset email failed:', err.message)
    })
  } catch (error) {
    next(error)
  }
}

// ── Step 2 (optional UI): Verify token is still valid ────────────────────────
export const verifyResetToken = async (req, res, next) => {
  try {
    const { error, value } = verifyTokenSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, 'Invalid token format.')

    const hashedToken = hashValue(value.token)
    // Raw collection access — passwordResetToken is select:false
    const userDoc = await User.collection.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!userDoc) throw new ApiError(400, 'Reset link is invalid or has expired.')

    res.status(200).json(new ApiResponse(200, { valid: true, name: `${userDoc.firstName} ${userDoc.lastName}` }, 'Token is valid.'))
  } catch (error) {
    next(error)
  }
}

// ── Step 3: Reset password using the token ───────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { error, value } = resetSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, error.details[0].message)

    const { token, newPassword } = value
    const hashedToken = hashValue(token)

    // Use raw collection access to find by select:false field passwordResetToken
    const userDoc = await User.collection.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!userDoc) throw new ApiError(400, 'Reset link is invalid or has expired. Please request a new one.')

    // Use Mongoose to update password (triggers bcrypt pre-save hook)
    const user = await User.findById(userDoc._id).select('+password')
    if (!user) throw new ApiError(400, 'Reset link is invalid or has expired.')

    user.password = newPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.mustChangePassword = false
    user.loginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. You can now log in.'))
  } catch (error) {
    next(error)
  }
}

// ── Set/Update security question (authenticated) ─────────────────────────────
export const setSecurityQuestion = async (req, res, next) => {
  try {
    const schema = Joi.object({
      question: Joi.string().trim().min(5).max(200).required(),
      answer: Joi.string().trim().min(1).max(200).required(),
    })
    const { error, value } = schema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, error.details[0].message)

    const user = await User.findById(req.user.id)
    if (!user) throw new ApiError(404, 'User not found')

    user.securityQuestion = value.question.trim()
    user.securityAnswer = hashValue(value.answer) // stored as SHA-256 hash
    await user.save()

    res.status(200).json(new ApiResponse(200, { securityQuestion: user.securityQuestion }, 'Security question saved.'))
  } catch (error) {
    next(error)
  }
}
