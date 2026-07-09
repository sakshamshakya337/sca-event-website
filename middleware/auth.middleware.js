import jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError.js'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set.')
  process.exit(1)
}

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required'))
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return next(new ApiError(401, 'Session expired or invalid. Please log in again.'))
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new ApiError(401, 'User no longer exists'))
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Account is deactivated'))
    }

    // Reject tokens issued before a password change
    if (user.passwordChangedAt) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000)
      if (decoded.iat < changedAt) {
        return next(new ApiError(401, 'Password recently changed. Please log in again.'))
      }
    }

    req.user = user
    next()
  } catch (error) {
    next(new ApiError(401, 'Authentication failed'))
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'))
    }
    next()
  }
}
