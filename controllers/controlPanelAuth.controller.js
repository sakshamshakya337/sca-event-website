import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Joi from 'joi'
import User from '../models/User.js'
import Otp from '../models/Otp.js'
import RefreshToken from '../models/RefreshToken.js'
import AuditLog from '../models/AuditLog.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import { sendMail } from '../utils/mailer.js'
import { otpEmailTemplate } from '../utils/emailTemplates.js'
import { verifyTurnstile } from '../utils/turnstile.js'

// ── Constants ─────────────────────────────────────────────────────────────────
const PRIVILEGED_ROLES = [
  'admin',
  'superadmin',
  'hos',
  'dean',
  'hod',
  'faculty_coordinator',
  'faculty',
]


const OTP_EXPIRATION_MINUTES = 5
const MAX_OTP_ATTEMPTS = 3
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('FATAL: JWT_SECRET is not set.')
  return secret
}

const hashSha256 = (val) =>
  crypto.createHash('sha256').update(String(val).trim()).digest('hex')

// Helper for cookie options
const getCookieOptions = (maxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  }
}

// Cookie helper header builder for Express without cookie-parser
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'SameSite=Strict' : 'SameSite=Lax'
  const secure = isProduction ? '; Secure' : ''

  const cookies = [
    `refreshToken=${refreshToken}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; ${sameSite}${secure}`,
    `accessToken=${accessToken}; Path=/; HttpOnly; Max-Age=${15 * 60}; ${sameSite}${secure}`,
  ]

  res.setHeader('Set-Cookie', cookies)
}

export const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'SameSite=Strict' : 'SameSite=Lax'
  const secure = isProduction ? '; Secure' : ''

  const cookies = [
    `refreshToken=; Path=/; HttpOnly; Max-Age=0; ${sameSite}${secure}`,
    `accessToken=; Path=/; HttpOnly; Max-Age=0; ${sameSite}${secure}`,
  ]

  res.setHeader('Set-Cookie', cookies)
}

// ── Validation Schemas ────────────────────────────────────────────────────────
const validateAccountSchema = Joi.object({
  identifier: Joi.string().trim().min(2).max(254).required(),
  turnstileToken: Joi.string().required(),
})

const verifyOtpSchema = Joi.object({
  identifier: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required(),
})

const verifyPasswordSchema = Joi.object({
  preAuthToken: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
})

// ── Helper to find privileged user by identifier ────────────────────────────
const findPrivilegedUser = async (identifier) => {
  const rawId = identifier.trim()
  const normalizedEmail = rawId.toLowerCase()
  const normalizedId = rawId.toUpperCase()

  const user = await User.findOne({
    role: { $in: PRIVILEGED_ROLES },
    $or: [
      { personalEmail: normalizedEmail },
      { officialEmail: normalizedEmail },
      { employeeId: normalizedId },
      { registrationNumber: normalizedId },
    ],
  }).select('+password')

  return user
}

// ── STEP 1: Account Validation ────────────────────────────────────────────────
export const validateAccount = async (req, res, next) => {
  try {
    const { error, value } = validateAccountSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, 'Invalid request parameters.')

    const { identifier, turnstileToken } = value

    // Turnstile bot protection check
    const captcha = await verifyTurnstile(turnstileToken, req.ip)
    if (!captcha.success) {
      throw new ApiError(400, 'Security verification failed. Please refresh and try again.')
    }

    const user = await findPrivilegedUser(identifier)

    // Return generic error for unauthorized or non-existent account to prevent scanning
    if (!user || !user.isActive) {
      await AuditLog.create({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        email: identifier.toLowerCase(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: 'Attempted login for non-existent or inactive privileged account',
      })
      throw new ApiError(401, 'Invalid employee credentials or insufficient privileges.')
    }

    // Mask email for display on OTP step
    const targetEmail = user.officialEmail || user.personalEmail
    const maskedEmail = targetEmail.replace(/(.{2}).+(@.+)/, '$1***$2')

    await AuditLog.create({
      action: 'ACCOUNT_VALIDATED',
      userId: user._id,
      email: targetEmail,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: `Validated privileged user (${user.role})`,
    })

    res.status(200).json(new ApiResponse(200, {
      validated: true,
      maskedEmail,
      identifier: targetEmail,
    }, 'Account validated successfully.'))
  } catch (err) {
    next(err)
  }
}

// ── STEP 2: Send OTP ──────────────────────────────────────────────────────────
export const sendOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body
    if (!identifier) throw new ApiError(400, 'Identifier is required.')

    const user = await findPrivilegedUser(identifier)
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials.')
    }

    const targetEmail = user.officialEmail || user.personalEmail

    // Check account lockout
    const now = Date.now()
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / 60000)
      throw new ApiError(429, `Account locked. Please try again in ${minutesLeft} minute(s).`)
    }

    // Invalidate existing active OTPs for this user
    await Otp.updateMany({ userId: user._id, isUsed: false }, { isUsed: true })

    // Generate cryptographically secure 6-digit numeric OTP
    const otpCode = crypto.randomInt(100000, 999999).toString()
    const otpHash = hashSha256(otpCode)
    const expiresAt = new Date(now + OTP_EXPIRATION_MINUTES * 60 * 1000)

    await Otp.create({
      userId: user._id,
      email: targetEmail,
      otpHash,
      expiresAt,
    })

    await AuditLog.create({
      action: 'OTP_REQUESTED',
      userId: user._id,
      email: targetEmail,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: 'Generated and sent OTP email',
    })

    // Dispatch email asynchronously
    const html = otpEmailTemplate({
      name: `${user.firstName} ${user.lastName}`,
      otpCode,
      expiresMinutes: OTP_EXPIRATION_MINUTES,
    })

    sendMail({
      to: targetEmail,
      subject: '🔐 SCA Control Panel One-Time Password (OTP)',
      html,
    }).catch((err) => {
      console.error('❌ Failed to send Control Panel OTP email:', err.message)
    })

    res.status(200).json(new ApiResponse(200, {
      sent: true,
      expiresInSeconds: OTP_EXPIRATION_MINUTES * 60,
    }, 'OTP sent successfully to your registered email.'))
  } catch (err) {
    next(err)
  }
}

// ── STEP 3: Verify OTP ────────────────────────────────────────────────────────
export const verifyOtp = async (req, res, next) => {
  try {
    const { error, value } = verifyOtpSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, error.details[0].message)

    const { identifier, otp } = value
    const user = await findPrivilegedUser(identifier)
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials.')

    const targetEmail = user.officialEmail || user.personalEmail
    const otpRecord = await Otp.findOne({
      userId: user._id,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!otpRecord) {
      await AuditLog.create({
        action: 'OTP_FAILED',
        userId: user._id,
        email: targetEmail,
        userRole: user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: 'OTP verification failed: Expired or non-existent code',
      })
      throw new ApiError(400, 'OTP code has expired or was not requested. Please click resend.')
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      otpRecord.isUsed = true
      await otpRecord.save()
      throw new ApiError(429, 'Maximum OTP retry attempts exceeded. Please request a new OTP.')
    }

    const inputHash = hashSha256(otp)
    if (inputHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1
      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        otpRecord.isUsed = true
      }
      await otpRecord.save()

      await AuditLog.create({
        action: 'OTP_FAILED',
        userId: user._id,
        email: targetEmail,
        userRole: user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: `Incorrect OTP attempt (${otpRecord.attempts}/${MAX_OTP_ATTEMPTS})`,
      })

      const attemptsRemaining = MAX_OTP_ATTEMPTS - otpRecord.attempts
      throw new ApiError(400, `Invalid OTP code. ${attemptsRemaining} attempt(s) remaining.`)
    }

    // OTP verified successfully
    otpRecord.isUsed = true
    await otpRecord.save()

    // Generate short-lived (5-min) intermediate pre-auth token
    const preAuthToken = jwt.sign(
      { id: user._id.toString(), email: targetEmail, scope: 'pre-auth-otp-verified' },
      getJwtSecret(),
      { expiresIn: '5m' }
    )

    await AuditLog.create({
      action: 'OTP_VERIFIED',
      userId: user._id,
      email: targetEmail,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: 'OTP verified successfully',
    })

    res.status(200).json(new ApiResponse(200, {
      verified: true,
      preAuthToken,
    }, 'OTP verified successfully. Please enter your password.'))
  } catch (err) {
    next(err)
  }
}

// ── STEP 4: Password Verification & Session Creation ─────────────────────────
export const verifyPassword = async (req, res, next) => {
  try {
    const { error, value } = verifyPasswordSchema.validate(req.body, { stripUnknown: true })
    if (error) throw new ApiError(400, error.details[0].message)

    const { preAuthToken, password } = value

    // Decode and verify pre-auth token
    let decoded
    try {
      decoded = jwt.verify(preAuthToken, getJwtSecret())
    } catch (e) {
      throw new ApiError(401, 'OTP verification session expired. Please restart login.')
    }

    if (decoded.scope !== 'pre-auth-otp-verified') {
      throw new ApiError(401, 'Invalid authentication state.')
    }

    const user = await User.findById(decoded.id).select('+password')
    if (!user || !user.isActive || !PRIVILEGED_ROLES.includes(user.role)) {
      throw new ApiError(401, 'Account unavailable.')
    }

    // Check account lockout
    const now = Date.now()
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / 60000)
      throw new ApiError(429, `Account locked. Try again in ${minutesLeft} minute(s).`)
    }

    // Verify password
    const isMatch = user.password ? await user.comparePassword(password) : false

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(now + LOCK_DURATION_MS)
        user.loginAttempts = 0
        await user.save()

        await AuditLog.create({
          action: 'ACCOUNT_LOCKED',
          userId: user._id,
          email: user.personalEmail,
          userRole: user.role,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || '',
          details: 'Account locked for 15 minutes due to consecutive failed password attempts',
        })

        throw new ApiError(429, 'Too many failed password attempts. Account locked for 15 minutes.')
      }
      await user.save()

      await AuditLog.create({
        action: 'LOGIN_FAILED',
        userId: user._id,
        email: user.personalEmail,
        userRole: user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: `Incorrect password attempt (${user.loginAttempts}/${MAX_LOGIN_ATTEMPTS})`,
      })

      throw new ApiError(401, 'Invalid password.')
    }

    // Password verified! Reset lockout state
    user.lastLogin = new Date()
    user.loginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    // Issue Access Token & Refresh Token
    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      getJwtSecret(),
      { expiresIn: '15m' }
    )

    const rawRefreshToken = crypto.randomBytes(40).toString('hex')
    const refreshTokenHash = hashSha256(rawRefreshToken)
    const tokenFamily = crypto.randomUUID()
    const refreshExpiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000) // 7 days

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      family: tokenFamily,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: refreshExpiresAt,
    })

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, rawRefreshToken)

    await AuditLog.create({
      action: 'LOGIN_SUCCESS',
      userId: user._id,
      email: user.personalEmail,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: 'Privileged user authenticated successfully via Control Panel gateway',
    })

    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json(new ApiResponse(200, {
      user: userResponse,
      accessToken,
      role: user.role,
    }, 'Authentication successful.'))
  } catch (err) {
    next(err)
  }
}

// ── Refresh Token Rotation ────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    let rawToken
    if (req.headers.cookie) {
      const match = req.headers.cookie.match(/refreshToken=([^;]+)/)
      if (match) rawToken = match[1]
    }

    if (!rawToken && req.body.refreshToken) {
      rawToken = req.body.refreshToken
    }

    if (!rawToken) throw new ApiError(401, 'Refresh token missing.')

    const tokenHash = hashSha256(rawToken)
    const storedToken = await RefreshToken.findOne({ tokenHash })

    if (!storedToken) {
      clearAuthCookies(res)
      throw new ApiError(401, 'Invalid or expired session.')
    }

    // Reuse Detection / Security violation check
    if (storedToken.isRevoked) {
      // Automatic revocation of entire token family if stolen token is reused
      await RefreshToken.updateMany({ family: storedToken.family }, { isRevoked: true })
      clearAuthCookies(res)

      await AuditLog.create({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        userId: storedToken.userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: 'Refresh token reuse detected! Revoked all family tokens.',
      })

      throw new ApiError(401, 'Security warning: Session compromised. Please log in again.')
    }

    if (storedToken.expiresAt < new Date()) {
      storedToken.isRevoked = true
      await storedToken.save()
      clearAuthCookies(res)
      throw new ApiError(401, 'Session expired. Please log in again.')
    }

    // Revoke current token and issue new token in same family (Rotation)
    storedToken.isRevoked = true
    await storedToken.save()

    const user = await User.findById(storedToken.userId)
    if (!user || !user.isActive) {
      clearAuthCookies(res)
      throw new ApiError(401, 'Account deactivated.')
    }

    const newAccessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      getJwtSecret(),
      { expiresIn: '15m' }
    )

    const newRawRefreshToken = crypto.randomBytes(40).toString('hex')
    const newTokenHash = hashSha256(newRawRefreshToken)

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      family: storedToken.family,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    setAuthCookies(res, newAccessToken, newRawRefreshToken)

    await AuditLog.create({
      action: 'REFRESH_TOKEN_ROTATED',
      userId: user._id,
      email: user.personalEmail,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: 'Rotated refresh token successfully',
    })

    res.status(200).json(new ApiResponse(200, {
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.personalEmail,
      },
    }, 'Token refreshed.'))
  } catch (err) {
    next(err)
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutControlPanel = async (req, res, next) => {
  try {
    let rawToken
    if (req.headers.cookie) {
      const match = req.headers.cookie.match(/refreshToken=([^;]+)/)
      if (match) rawToken = match[1]
    }

    if (rawToken) {
      const tokenHash = hashSha256(rawToken)
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true })
    }

    if (req.user) {
      await AuditLog.create({
        action: 'LOGOUT',
        userId: req.user._id,
        email: req.user.personalEmail,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        details: 'User logged out',
      })
    }

    clearAuthCookies(res)
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'))
  } catch (err) {
    next(err)
  }
}
