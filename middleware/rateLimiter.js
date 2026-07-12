import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const baseOptions = {
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  // Custom handler to set Retry-After header
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000)
    res.setHeader('Retry-After', retryAfter)
    res.status(429).json(options.message)
  }
}

const checkSkip = async (req) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return false;
    
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    const decoded = jwt.verify(token, secret);
    if (!decoded || !decoded.id) return false;
    
    const user = await User.findById(decoded.id).select('role').lean();
    if (user && ['admin', 'superadmin', 'dean', 'hos'].includes(user.role)) {
      return true; // Skip rate limiting for these roles
    }
  } catch (error) {
    return false;
  }
  return false;
};

// General API — 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: checkSkip,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

// Login — 10 attempts per 15 minutes per IP, only counts failures
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
})

// Signup — 5 submissions per hour per IP
export const signupLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many signup attempts from this IP.' },
})

// Contact form — 3 submissions per hour per IP
export const contactLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many contact submissions. Please wait an hour.' },
})

// File uploads — 10 per 30 minutes per IP
export const uploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 30 * 60 * 1000,
  max: 10,
  skip: checkSkip,
  message: { success: false, message: 'Upload limit reached. Please try again later.' },
})
