import rateLimit from 'express-rate-limit'

// General API: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth endpoints: 10 attempts per 15 minutes (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
})

// Signup: 5 submissions per hour per IP
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many signup attempts from this IP.' },
})

// Contact form: 3 submissions per hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many contact submissions. Please wait an hour.' },
})

// File upload: 10 per 30 minutes
export const uploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Upload limit reached. Please try again later.' },
})
