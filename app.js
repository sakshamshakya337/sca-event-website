import express from 'express'
import helmet from 'helmet'
import net from 'net'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import xssClean from 'xss-clean'
import hpp from 'hpp'
import compression from 'compression'
import morgan from 'morgan'
import { generalLimiter } from './middleware/rateLimiter.js'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import eventRoutes from './routes/event.routes.js'
import todoRoutes from './routes/todo.routes.js'
import taskRoutes from './routes/task.routes.js'
import contactRoutes from './routes/contact.routes.js'
import verificationRoutes from './routes/verification.routes.js'
import galleryRoutes from './routes/gallery.routes.js'

const app = express()

// Make req.query writable and configurable so that mongo-sanitize or custom handlers can modify it safely
app.use((req, res, next) => {
  const queryVal = req.query || {};
  Object.defineProperty(req, 'query', {
    value: { ...queryVal },
    writable: true,
    configurable: true
  });
  next();
});

// Trust the first proxy hop (Render, Railway, Heroku, etc.)
// This allows express-rate-limit to read the real client IP from X-Forwarded-For
app.set('trust proxy', 1)

// Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  // Disable CSP for API responses — the static frontend is served by Vercel's
  // CDN with its own headers. CSP on JSON responses is unnecessary and can
  // interfere with CORS preflight in some browsers.
  contentSecurityPolicy: false,
}))

// CORS — On Vercel the frontend and API share the same domain, so CORS
// is technically not needed. We allow the configured FRONTEND_URL plus
// the auto-injected VERCEL_URL so both custom domains and preview
// deployments work without manual env updates.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (origin is undefined) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    // Also allow any *.vercel.app preview deploy
    if (origin.endsWith('.vercel.app')) return cb(null, true)
    cb(null, false)
  },
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

// Ensure DB is connected before handling any request.
// Required when Express runs as a single Vercel serverless function
// (there is no persistent server startup hook). Cached, so it's a no-op
// after the first connection within a warm container.
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

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
app.use('/api/galleries', galleryRoutes)

// Test SMTP connection to Gmail on port 465
app.get('/test-smtp', (req, res) => {
  const socket = net.connect(465, 'smtp.gmail.com')
  socket.setTimeout(10000)
  
  socket.on('connect', () => {
    res.send('Connected to smtp.gmail.com on port 465')
    socket.destroy()
  })
  
  socket.on('timeout', () => {
    res.send('Timeout: Port 465 might be blocked')
    socket.destroy()
  })
  
  socket.on('error', (err) => {
    res.send('Error: ' + err.message)
    socket.destroy()
  })
})

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
