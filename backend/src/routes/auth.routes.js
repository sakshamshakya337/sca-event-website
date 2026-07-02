import express from 'express'
import { login, getCurrentUser, logout, changePassword, signup, forgotPassword, resetPassword, verifyResetToken, setSecurityQuestion } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { authLimiter, signupLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/signup', signupLimiter, signup)
router.post('/login', authLimiter, login)
router.get('/me', protect, getCurrentUser)
router.post('/change-password', protect, changePassword)
router.post('/logout', logout)

// Security question (authenticated)
router.post('/security-question', protect, setSecurityQuestion)
router.get('/security-question', protect, async (req, res) => {
  const User = (await import('../models/User.js')).default
  const user = await User.findById(req.user.id).select('securityQuestion')
  res.json({ success: true, data: { securityQuestion: user?.securityQuestion || null } })
})

// Get security question for unauthenticated password reset (returns question only, no answer)
router.post('/get-security-question', authLimiter, async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default
    const { identifier, role } = req.body
    if (!identifier || !role) return res.status(400).json({ success: false, message: 'Missing fields' })

    const rawId = identifier.trim()
    const normalizedId = rawId.toUpperCase()
    let user

    if (role === 'student') {
      // Case-insensitive search to handle any stored format
      user = await User.findOne({
        role: 'student',
        registrationNumber: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('securityQuestion isActive')
      if (!user) {
        user = await User.findOne({ role: 'student', registrationNumber: normalizedId })
          .select('securityQuestion isActive')
      }
    } else {
      user = await User.findOne({
        role: 'faculty',
        employeeId: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('securityQuestion isActive')
      if (!user) {
        user = await User.findOne({ role: 'faculty', employeeId: normalizedId })
          .select('securityQuestion isActive')
      }
    }

    if (!user || user.isActive === false || !user.securityQuestion) {
      return res.json({ success: true, data: { securityQuestion: null } })
    }

    res.json({ success: true, data: { securityQuestion: user.securityQuestion } })
  } catch (err) { next(err) }
})

// Password reset flow (public — rate limited)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/verify-reset-token', authLimiter, verifyResetToken)
router.post('/reset-password', authLimiter, resetPassword)

export default router
