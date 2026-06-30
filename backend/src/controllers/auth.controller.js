import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production', {
    expiresIn: '7d'
  })
}

export const buildSignupDuplicateQuery = ({ role, personalEmail, officialEmail, registrationNumber, employeeId }) => {
  const normalizedRole = role?.toLowerCase()
  const normalizedPersonalEmail = personalEmail?.trim().toLowerCase()
  const normalizedOfficialEmail = officialEmail?.trim().toLowerCase()
  const normalizedRegistrationNumber = registrationNumber?.trim().toUpperCase()
  const normalizedEmployeeId = employeeId?.trim().toUpperCase()

  const conditions = []

  if (normalizedPersonalEmail) {
    conditions.push({ personalEmail: normalizedPersonalEmail })
  }

  if (normalizedOfficialEmail) {
    conditions.push({ officialEmail: normalizedOfficialEmail })
  }

  if (normalizedRole === 'student' && normalizedRegistrationNumber) {
    conditions.push({ registrationNumber: normalizedRegistrationNumber })
  }

  if (normalizedRole === 'faculty' && normalizedEmployeeId) {
    conditions.push({ employeeId: normalizedEmployeeId })
  }

  return conditions.length > 0 ? { $or: conditions } : {}
}

export const signup = async (req, res, next) => {
  try {
    const {
      role,
      firstName,
      lastName,
      personalEmail,
      phone,
      password,
      registrationNumber,
      program,
      degree,
      semester,
      section,
      employeeId,
      department,
      designation,
      officialEmail
    } = req.body

    if (!role || !firstName || !lastName || !personalEmail || !password) {
      throw new ApiError(400, 'Required fields are missing')
    }

    // Check if user already exists using only the relevant identifiers for the selected role
    const duplicateQuery = buildSignupDuplicateQuery({
      role,
      personalEmail,
      officialEmail,
      registrationNumber,
      employeeId
    })

    const existingUser = Object.keys(duplicateQuery).length > 0
      ? await User.findOne(duplicateQuery)
      : null

    if (existingUser) {
      throw new ApiError(400, 'User with this email or ID already exists')
    }

    // Create new user
    const userData = {
      role: role.toLowerCase(),
      firstName,
      lastName,
      personalEmail: personalEmail.toLowerCase(),
      phone,
      password,
      isVerified: false,
      isActive: true,
      mustChangePassword: false
    }

    if (role === 'student') {
      userData.registrationNumber = registrationNumber?.toUpperCase()
      userData.program = program
      userData.degree = degree
      userData.semester = semester
      userData.section = section
    } else if (role === 'faculty') {
      userData.employeeId = employeeId?.toUpperCase()
      userData.department = department
      userData.designation = designation
      userData.officialEmail = officialEmail?.toLowerCase()
    }

    const user = await User.create(userData)

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json(
      new ApiResponse(201, { user: userResponse, token }, 'Signup successful')
    )
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    console.log('🔑 Login attempt:', { email, role, passwordLength: password?.length })

    if (!email || !password) {
      throw new ApiError(400, 'Email or registration number and password are required')
    }

    const identifier = email.trim()
    const normalizedEmail = identifier.toLowerCase()
    const normalizedRegistration = identifier.toUpperCase()

    // Find user by email or registration number. Role is optional for the single login form.
    let user
    if (role?.toLowerCase() === 'student') {
      user = await User.findOne({ registrationNumber: normalizedRegistration }).select('+password')
    } else {
      user = await User.findOne({
        $or: [
          { personalEmail: normalizedEmail },
          { officialEmail: normalizedEmail },
          { registrationNumber: normalizedRegistration },
          { employeeId: normalizedRegistration }
        ]
      }).select('+password')
    }

    console.log('👤 Found user:', user ? { id: user._id, role: user.role, hasPassword: !!user.password } : null)

    if (!user) {
      throw new ApiError(401, 'Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated')
    }

    // Check if user is verified (except admin/superadmin)
    if (user.role !== 'admin' && user.role !== 'superadmin' && !user.isVerified) {
      throw new ApiError(403, 'Account not verified yet')
    }

    // Check password if user has a password set
    let isMatch = false
    if (user.password) {
      isMatch = await user.comparePassword(password)
      console.log('🔐 Password match:', isMatch)
      if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials')
      }
    } else {
      console.log('⚠️ User has no password set')
    }

    // Update last login
    user.lastLogin = new Date()
    user.loginAttempts = 0
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json(
      new ApiResponse(200, { user: userResponse, token }, 'Login successful')
    )
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body

    // Validation
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long')
    }

    // Find user
    const user = await User.findById(req.user.id).select('+password')
    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    // Update password
    user.password = newPassword
    user.mustChangePassword = false
    user.passwordChangedAt = new Date()
    await user.save()

    // Generate new token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json(
      new ApiResponse(200, { user: userResponse, token }, 'Password changed successfully')
    )
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'))
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'))
}
