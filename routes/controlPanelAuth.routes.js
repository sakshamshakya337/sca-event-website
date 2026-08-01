import express from 'express'
import {
  validateAccount,
  sendOtp,
  verifyOtp,
  verifyPassword,
  refreshToken,
  logoutControlPanel,
} from '../controllers/controlPanelAuth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { controlPanelLimiter, otpLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Step 1: Validate privileged identity + Turnstile CAPTCHA
router.post('/validate-account', controlPanelLimiter, validateAccount)

// Step 2: Trigger OTP send to registered email
router.post('/send-otp', otpLimiter, sendOtp)

// Step 3: Verify 6-digit OTP code -> returns preAuthToken
router.post('/verify-otp', otpLimiter, verifyOtp)

// Step 4: Verify password with preAuthToken -> sets HTTP-Only cookies & returns user profile + role
router.post('/verify-password', controlPanelLimiter, verifyPassword)

// Token Refresh & Logout
router.post('/refresh-token', refreshToken)
router.post('/logout', protect, logoutControlPanel)

export default router
