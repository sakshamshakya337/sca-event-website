import jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError.js'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production')
    const user = await User.findById(decoded.id)
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route')
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized')
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role ${req.user.role} is not authorized to access this route`)
    }
    next()
  }
}
