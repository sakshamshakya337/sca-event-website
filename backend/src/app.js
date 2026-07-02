import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import xssClean from 'xss-clean'
import hpp from 'hpp'
import compression from 'compression'
import morgan from 'morgan'
import { generalLimiter } from './middleware/rateLimiter.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import eventRoutes from './routes/event.routes.js'
import todoRoutes from './routes/todo.routes.js'
import taskRoutes from './routes/task.routes.js'
import contactRoutes from './routes/contact.routes.js'
import verificationRoutes from './routes/verification.routes.js'

const app = express()

// Trust the first proxy hop (Render, Railway, Heroku, etc.)
// This allows express-rate-limit to read the real client IP from X-Forwarded-For
app.set('trust proxy', 1)

// Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
    },
  },
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body Parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Sanitization — prevent NoSQL injection & XSS
app.use(mongoSanitize())
app.use(xssClean())
app.use(hpp())

// Compression
app.use(compression())

// Logging — never log request bodies in production
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Global rate limit — 100 req/15min per IP
app.use('/api', generalLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/verification', verificationRoutes)

// Health Check — only confirms the server is alive, no env details
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global Error Handler — never leak stack traces in production
app.use((err, req, res, next) => {
  // Handle multer errors explicitly — return 400 with a clear message
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: `Unexpected file field "${err.field}". Allowed fields: image, gallery.`,
    })
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5 MB per image.',
    })
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err)
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

export default app
