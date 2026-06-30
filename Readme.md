# TRAE AI EDITOR — FULL PROJECT BOOTSTRAP PROMPT
# SCA Event Management System (SCA EMS)
# School of Computer Applications, Lovely Professional University
# Stack: React 18 + Vite + TailwindCSS + MongoDB + Firebase Auth + Node.js/Express

---

## WHAT YOU ARE BUILDING

A role-based internal event management web application for LPU's School of Computer
Applications. It has 4 user roles (Student, Faculty, Admin, Superadmin), a self-registration
flow with document upload and admin verification, event lifecycle management, todo/task
tracking, and a contact query system.

This is a MONOREPO with two separate apps:
- /frontend  → React 18 + Vite + TailwindCSS
- /backend   → Node.js + Express + MongoDB (Mongoose) + Firebase Admin SDK

---

## TECH STACK — EXACT VERSIONS

### Frontend
- React 18.3.x
- Vite 5.x (build tool)
- TailwindCSS 3.x
- React Router DOM 6.x (client-side routing)
- Axios 1.x (HTTP client)
- Firebase 10.x (client SDK — Auth only)
- React Hook Form 7.x (form handling + validation)
- Zod 3.x (schema validation, paired with React Hook Form)
- Zustand 4.x (lightweight global state management)
- React Hot Toast (toast notifications)
- Lucide React (icons — consistent with Stitch design)
- React Dropzone (document upload UI)
- date-fns (date formatting)
- clsx + tailwind-merge (conditional classnames utility)

### Backend
- Node.js 20.x LTS
- Express 4.x
- Mongoose 8.x (MongoDB ODM)
- Firebase Admin SDK 12.x (token verification)
- Multer 1.x (file upload handling)
- Cloudinary 2.x (document + photo storage — free tier, 25GB)
- Nodemailer 6.x (email sending via Brevo SMTP — free 300 emails/day)
- hCaptcha (spam protection — free, privacy-first, no Google dependency)
- express-rate-limit 7.x (API rate limiting)
- helmet 7.x (HTTP security headers)
- cors 2.x
- express-mongo-sanitize (NoSQL injection prevention)
- hpp (HTTP parameter pollution prevention)
- xss-clean (XSS sanitization)
- compression (gzip response compression)
- winston 3.x + morgan (logging)
- dotenv 16.x
- joi 17.x (backend request validation)
- jsonwebtoken 9.x (session tokens alongside Firebase)
- bcryptjs 2.x (password hashing)
- uuid 9.x (reference number generation)

### Database
- MongoDB Atlas (free M0 tier — 512MB, sufficient for this project)
- Collections: users, events, todos, tasks, contact_queries, verification_applications

### Services (all free tier)
- Firebase Authentication (Google project, free Spark plan)
- Cloudinary (document/photo uploads, free 25GB storage)
- Brevo (formerly Sendinblue) SMTP — 300 emails/day free, no credit card
- hCaptcha — free, replaces reCAPTCHA, GDPR compliant
- MongoDB Atlas M0 — free forever cluster

---

## PROJECT STRUCTURE TO SCAFFOLD

```
sca-ems/
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── config/
│   │   │   ├── firebase.js          ← Firebase client init
│   │   │   ├── axios.js             ← Axios instance with interceptors
│   │   │   └── constants.js         ← App-wide constants (roles, status enums)
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js         ← Zustand: user, token, role, isLoading
│   │   │   ├── eventStore.js        ← Zustand: events list, selected event
│   │   │   └── uiStore.js           ← Zustand: sidebar open, theme (light/dark)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js           ← Firebase auth state listener
│   │   │   ├── useRole.js           ← Returns current role, hasPermission()
│   │   │   └── useTheme.js          ← Toggle light/dark, persist to localStorage
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.js             ← clsx + tailwind-merge helper, formatDate
│   │   │   └── validators.js        ← Zod schemas for all forms
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx      ← Role-aware nav, collapsible
│   │   │   │   ├── Navbar.jsx       ← Top bar, theme toggle, user menu
│   │   │   │   └── PageWrapper.jsx  ← Sidebar + Navbar shell for auth pages
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx       ← variants: primary, outline, danger, ghost
│   │   │   │   ├── Input.jsx        ← with label, error, helper text
│   │   │   │   ├── Badge.jsx        ← status + priority + role badges
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx        ← reusable centered modal with overlay
│   │   │   │   ├── Drawer.jsx       ← right-side slide-in panel
│   │   │   │   ├── Table.jsx        ← sortable, with loading skeleton
│   │   │   │   ├── Skeleton.jsx     ← shimmer loading blocks
│   │   │   │   ├── Toast.jsx        ← wraps react-hot-toast
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Toggle.jsx       ← iOS-style switch
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Textarea.jsx
│   │   │   │   ├── FileDropzone.jsx ← react-dropzone wrapper
│   │   │   │   ├── StepProgress.jsx ← 3-step wizard indicator
│   │   │   │   ├── StatCard.jsx     ← dashboard stat cards
│   │   │   │   └── EmptyState.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── RoleTab.jsx      ← 4-tab role selector on login
│   │   │   │   ├── PasswordStrength.jsx
│   │   │   │   └── HCaptchaWidget.jsx ← hCaptcha wrapper component
│   │   │   │
│   │   │   └── events/
│   │   │       ├── EventRow.jsx     ← table row with accordion expand
│   │   │       ├── TodoList.jsx     ← expandable todos per event
│   │   │       └── EventStatusBadge.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Team.jsx
│   │   │   │   └── Contact.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── Portal.jsx       ← unified login (Screen 05)
│   │   │   │   ├── ForcePassword.jsx ← first-login password change (Screen 06)
│   │   │   │   └── Pending.jsx      ← account awaiting approval (Screen 27)
│   │   │   │
│   │   │   ├── signup/
│   │   │   │   ├── RoleSelect.jsx   ← Step 1 (Screen 23)
│   │   │   │   ├── StudentDetails.jsx ← Step 2 student (Screen 24)
│   │   │   │   ├── FacultyDetails.jsx ← Step 2 faculty (Screen 25)
│   │   │   │   └── DocumentUpload.jsx ← Step 3 (Screen 26)
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyEvents.jsx
│   │   │   │   ├── MyTasks.jsx
│   │   │   │   └── Profile.jsx
│   │   │   │
│   │   │   ├── faculty/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyEvents.jsx
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   ├── EditEvent.jsx
│   │   │   │   ├── MyTasks.jsx
│   │   │   │   └── Profile.jsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── AllEvents.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   ├── VerifyUsers.jsx      ← Screen 29 (queue)
│   │   │   │   ├── VerifyUserDetail.jsx ← Screen 30 (detail)
│   │   │   │   ├── ContactQueries.jsx
│   │   │   │   ├── MyTasks.jsx
│   │   │   │   └── Profile.jsx
│   │   │   │
│   │   │   └── superadmin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── Profile.jsx
│   │   │
│   │   └── routes/
│   │       ├── index.jsx            ← all routes defined here
│   │       ├── ProtectedRoute.jsx   ← checks auth + role before rendering
│   │       └── PublicOnlyRoute.jsx  ← redirects logged-in users away from /portal
│   │
│   ├── .env.local                   ← VITE_ prefixed env vars
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── server.js                ← Express app entry point
    │   ├── app.js                   ← Express app config (middleware stack)
    │   │
    │   ├── config/
    │   │   ├── db.js                ← MongoDB Atlas connection via Mongoose
    │   │   ├── firebase.js          ← Firebase Admin SDK init
    │   │   ├── cloudinary.js        ← Cloudinary config
    │   │   ├── mailer.js            ← Nodemailer + Brevo SMTP transport
    │   │   └── logger.js            ← Winston logger setup
    │   │
    │   ├── models/
    │   │   ├── User.js              ← see schema below
    │   │   ├── Event.js
    │   │   ├── Todo.js
    │   │   ├── Task.js
    │   │   ├── ContactQuery.js
    │   │   └── VerificationApplication.js
    │   │
    │   ├── middleware/
    │   │   ├── auth.js              ← verifyFirebaseToken, attachUser
    │   │   ├── roleGuard.js         ← requireRole('admin', 'superadmin')
    │   │   ├── rateLimiter.js       ← per-route rate limiters
    │   │   ├── upload.js            ← Multer + Cloudinary pipe
    │   │   ├── validate.js          ← Joi request body validator
    │   │   ├── sanitize.js          ← XSS + NoSQL injection cleaner
    │   │   └── errorHandler.js      ← global Express error handler
    │   │
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── userController.js
    │   │   ├── eventController.js
    │   │   ├── todoController.js
    │   │   ├── taskController.js
    │   │   ├── contactController.js
    │   │   └── verificationController.js
    │   │
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── user.routes.js
    │   │   ├── event.routes.js
    │   │   ├── todo.routes.js
    │   │   ├── task.routes.js
    │   │   ├── contact.routes.js
    │   │   └── verification.routes.js
    │   │
    │   ├── services/
    │   │   ├── emailService.js      ← sendApprovalEmail, sendRejectionEmail
    │   │   ├── cloudinaryService.js ← uploadFile, deleteFile
    │   │   └── captchaService.js    ← verifyHCaptchaToken()
    │   │
    │   └── utils/
    │       ├── ApiError.js          ← custom error class
    │       ├── ApiResponse.js       ← consistent JSON response wrapper
    │       ├── generateRefNumber.js ← SCA-YYYY-MM-XXXX format
    │       └── passwordGenerator.js ← secure random password for admin-created users
    │
    ├── .env
    ├── .gitignore
    └── package.json
```

---

## STEP 1 — INITIALIZE THE MONOREPO

Run these commands exactly:

```bash
mkdir sca-ems && cd sca-ems
git init
echo "node_modules/\n.env\n.env.local\ndist/\n*.log\nuploads/" > .gitignore

# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install all frontend dependencies
npm install react-router-dom axios firebase zustand react-hook-form zod \
  react-hot-toast lucide-react react-dropzone date-fns clsx tailwind-merge \
  @hookform/resolvers

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

# Backend
mkdir backend && cd backend
npm init -y
npm install express mongoose firebase-admin multer cloudinary nodemailer \
  express-rate-limit helmet cors express-mongo-sanitize hpp xss-clean \
  compression winston morgan dotenv joi jsonwebtoken bcryptjs uuid axios

npm install -D nodemon
cd ..
```

---

## STEP 2 — TAILWIND CONFIG

Replace `frontend/tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  '#1E3A5F',
          blue:  '#2563EB',
          hover: '#1D4ED8',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card:    '#FFFFFF',
          sidebar: '#F1F5F9',
        },
        status: {
          pending:   '#F59E0B',
          approved:  '#10B981',
          rejected:  '#EF4444',
          completed: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
```

Replace `frontend/src/index.css` with:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --sidebar-width: 240px;
    --navbar-height: 60px;
  }
  body {
    @apply font-sans text-slate-900 bg-white antialiased;
  }
  .dark body {
    @apply text-slate-100 bg-[#0B1120];
  }
}

@layer utilities {
  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
  .scrollbar-thin {
    scrollbar-width: thin;
  }
}
```

---

## STEP 3 — ENVIRONMENT VARIABLES

### frontend/.env.local
```
VITE_API_URL=http://localhost:4000/api

# Firebase (from your Firebase Console → Project Settings → Web App)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# hCaptcha (from hcaptcha.com → Sites → Site Key)
VITE_HCAPTCHA_SITE_KEY=
```

### backend/.env
```
NODE_ENV=development
PORT=4000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sca-ems?retryWrites=true&w=majority

# Firebase Admin (from Firebase Console → Project Settings → Service Accounts → Generate new private key)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudinary (from cloudinary.com → Dashboard)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Brevo SMTP (from app.brevo.com → SMTP & API → SMTP)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-login-email@gmail.com
BREVO_SMTP_PASS=your-brevo-smtp-key
BREVO_FROM_EMAIL=noreply@sca-ems.in
BREVO_FROM_NAME=SCA EMS — LPU

# hCaptcha Secret (from hcaptcha.com → Settings → Secret Key)
HCAPTCHA_SECRET_KEY=

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=
JWT_EXPIRES_IN=7d

# App
FRONTEND_URL=http://localhost:5173
APP_NAME=SCA EMS
```

---

## STEP 4 — MONGODB SCHEMAS

### backend/src/models/User.js
```javascript
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  firebaseUid:    { type: String, unique: true, sparse: true },
  role:           { type: String, enum: ['student','faculty','admin','superadmin'], required: true },
  firstName:      { type: String, required: true, trim: true },
  lastName:       { type: String, required: true, trim: true },
  personalEmail:  { type: String, required: true, lowercase: true, trim: true },
  officialEmail:  { type: String, lowercase: true, trim: true },
  phone:          { type: String, trim: true },
  password:       { type: String, select: false },
  mustChangePassword: { type: Boolean, default: false },
  isVerified:     { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true },

  // Student-only fields
  registrationNumber: { type: String, trim: true, uppercase: true },
  program:        String,
  degree:         String,
  semester:       String,
  section:        String,

  // Faculty-only fields
  employeeId:     { type: String, trim: true, uppercase: true },
  department:     String,
  designation:    String,

  // Profile
  profilePhotoUrl:     String,
  profilePhotoPublicId: String,

  // Security
  loginAttempts:  { type: Number, default: 0 },
  lockUntil:      Date,
  lastLogin:      Date,
  passwordChangedAt: Date,

}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordChangedAt = new Date()
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Virtual: full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Indexes
userSchema.index({ registrationNumber: 1 })
userSchema.index({ employeeId: 1 })
userSchema.index({ personalEmail: 1 })
userSchema.index({ role: 1, isVerified: 1 })

export default mongoose.model('User', userSchema)
```

### backend/src/models/VerificationApplication.js
```javascript
import mongoose from 'mongoose'

const verificationApplicationSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceNumber: { type: String, unique: true, required: true },
  status:         { type: String, enum: ['pending','approved','rejected'], default: 'pending' },

  // Uploaded documents
  universityIdUrl:      String,
  universityIdPublicId: String,
  profilePhotoUrl:      String,
  profilePhotoPublicId: String,

  // Admin review
  reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:     Date,
  rejectionReason: String,
  adminNotes:     String,

  // Checklist (admin marks these during review)
  checklist: {
    idMatchesApplication:  { type: Boolean, default: false },
    nameMatchesId:         { type: Boolean, default: false },
    photoAcceptable:       { type: Boolean, default: false },
    idNotExpired:          { type: Boolean, default: false },
    enrolledInSca:         { type: Boolean, default: false },
  },

}, { timestamps: true })

verificationApplicationSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('VerificationApplication', verificationApplicationSchema)
```

### backend/src/models/Event.js
```javascript
import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  type:           { type: String, enum: ['Workshop','Seminar','Cultural','Sports','Technical','Other'], required: true },
  date:           { type: Date, required: true },
  time:           String,
  venue:          { type: String, required: true, trim: true },
  expectedAudience: Number,
  description:    String,
  isImportant:    { type: Boolean, default: false },
  status:         { type: String, enum: ['pending','approved','rejected','completed'], default: 'pending' },

  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:     Date,
  rejectedReason: String,

  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true })

eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model('Event', eventSchema)
```

### backend/src/models/Todo.js
```javascript
import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title:      { type: String, required: true, trim: true },
  audience:   { type: String, enum: ['all','students','faculty'], default: 'all' },
  isImportant:{ type: Boolean, default: false },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export default mongoose.model('Todo', todoSchema)
```

### backend/src/models/Task.js
```javascript
import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  event:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['High','Medium','Low'], default: 'Medium' },
  dueDate:  Date,
  notes:    String,
  isDone:   { type: Boolean, default: false },
  doneAt:   Date,
}, { timestamps: true })

taskSchema.index({ assignedTo: 1, isDone: 1 })

export default mongoose.model('Task', taskSchema)
```

---

## STEP 5 — SECURITY MIDDLEWARE STACK

### backend/src/app.js
```javascript
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import compression from 'compression'
import morgan from 'morgan'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'

// Route imports
import authRoutes         from './routes/auth.routes.js'
import userRoutes         from './routes/user.routes.js'
import eventRoutes        from './routes/event.routes.js'
import todoRoutes         from './routes/todo.routes.js'
import taskRoutes         from './routes/task.routes.js'
import contactRoutes      from './routes/contact.routes.js'
import verificationRoutes from './routes/verification.routes.js'

const app = express()

// ── Security Headers ────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc:  ["'self'"],
    },
  },
}))

// ── CORS ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// ── Body Parsing ─────────────────────────────────────
app.use(express.json({ limit: '10kb' }))       // prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── Sanitization ─────────────────────────────────────
app.use(mongoSanitize())   // block NoSQL injection via $ operators
app.use(hpp())             // prevent HTTP parameter pollution

// ── Compression + Logging ────────────────────────────
app.use(compression())
app.use(morgan('dev'))

// ── Rate Limiting (global) ───────────────────────────
app.use('/api', generalLimiter)

// ── Routes ───────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/events',       eventRoutes)
app.use('/api/todos',        todoRoutes)
app.use('/api/tasks',        taskRoutes)
app.use('/api/contact',      contactRoutes)
app.use('/api/verification', verificationRoutes)

// ── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// ── Global Error Handler ─────────────────────────────
app.use(errorHandler)

export default app
```

### backend/src/middleware/rateLimiter.js
```javascript
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
```

### backend/src/middleware/auth.js
```javascript
import admin from '../config/firebase.js'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'

// Verify Firebase ID token from Authorization: Bearer <token> header
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided')
    }
    const idToken = authHeader.split('Bearer ')[1]
    const decoded = await admin.auth().verifyIdToken(idToken)
    req.firebaseUid = decoded.uid
    req.firebaseEmail = decoded.email
    next()
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}

// Attach full user document from MongoDB
export const attachUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUid })
    if (!user) throw new ApiError(404, 'User account not found')
    if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated')
    if (!user.isVerified) throw new ApiError(403, 'Your account is pending verification')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
```

### backend/src/middleware/roleGuard.js
```javascript
import { ApiError } from '../utils/ApiError.js'

// Usage: requireRole('admin', 'superadmin')
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'))
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`))
    }
    next()
  }
}
```

---

## STEP 6 — FIREBASE CLIENT SETUP

### frontend/src/config/firebase.js
```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
```

---

## STEP 7 — HCAPTCHA SETUP (no-spam contact + signup)

### Why hCaptcha over reCAPTCHA:
- 100% free, no usage limits on free tier
- GDPR compliant — does not track users like Google does
- Works globally without VPN issues (reCAPTCHA blocked in some regions)
- Same developer experience

### Get your keys:
1. Go to hcaptcha.com → Sign up free
2. Add a new site → copy SITE KEY → paste in frontend .env.local
3. Go to Settings → copy SECRET KEY → paste in backend .env

### frontend/src/components/auth/HCaptchaWidget.jsx
```jsx
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useRef } from 'react'

export default function HCaptchaWidget({ onVerify, onExpire }) {
  const captchaRef = useRef(null)

  return (
    <HCaptcha
      ref={captchaRef}
      sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
      onVerify={onVerify}
      onExpire={onExpire}
      theme="light"
    />
  )
}
```

Install: `npm install @hcaptcha/react-hcaptcha` in frontend

### backend/src/services/captchaService.js
```javascript
import axios from 'axios'

export const verifyHCaptcha = async (token) => {
  if (!token) return false
  try {
    const res = await axios.post(
      'https://hcaptcha.com/siteverify',
      new URLSearchParams({
        secret:   process.env.HCAPTCHA_SECRET_KEY,
        response: token,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    return res.data.success === true
  } catch {
    return false
  }
}
```

---

## STEP 8 — EMAIL SERVICE (Brevo SMTP)

### Why Brevo over other free options:
- 300 emails/day free, no credit card
- Reliable SMTP (not flagged as spam like Gmail SMTP)
- Transactional emails land in inbox, not spam
- SPF/DKIM easy to configure

### Get SMTP credentials:
1. Sign up at app.brevo.com
2. Go to SMTP & API → SMTP tab
3. Copy Host, Port, Login, Password → paste in backend .env

### backend/src/config/mailer.js
```javascript
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
})

// Verify connection on startup
transporter.verify((error) => {
  if (error) console.error('❌ Mail transporter error:', error)
  else console.log('✅ Mail transporter ready (Brevo SMTP)')
})
```

### backend/src/services/emailService.js
```javascript
import { transporter } from '../config/mailer.js'

const FROM = `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`

export const sendApprovalEmail = async ({ to, firstName, role, identifier }) => {
  const loginField = role === 'student' ? `Registration Number: ${identifier}` : `Email: ${identifier}`
  await transporter.sendMail({
    from: FROM,
    to,
    subject: '✅ Your SCA EMS Account Has Been Approved',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
        <div style="background:#1E3A5F;padding:24px;text-align:center">
          <h2 style="color:white;margin:0">SCA Event Management System</h2>
          <p style="color:#93C5FD;margin:4px 0 0">School of Computer Applications, LPU</p>
        </div>
        <div style="padding:40px;background:#fff">
          <div style="text-align:center;margin-bottom:24px">
            <div style="background:#ECFDF5;border-radius:50%;width:64px;height:64px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:32px">✅</div>
          </div>
          <h1 style="font-size:22px;color:#0F172A;text-align:center">Your Account Has Been Approved!</h1>
          <p style="color:#475569">Hi ${firstName},</p>
          <p style="color:#475569">Your SCA EMS account has been verified and activated by the administrator. You can now log in and access the platform.</p>
          <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin:24px 0">
            <p style="margin:4px 0;color:#0F172A"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
            <p style="margin:4px 0;color:#0F172A"><strong>${loginField}</strong></p>
            <p style="margin:4px 0;color:#0F172A"><strong>Login URL:</strong> ${process.env.FRONTEND_URL}/portal</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/portal" style="display:block;background:#2563EB;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600">Log In to SCA EMS →</a>
        </div>
        <div style="background:#F8FAFC;padding:16px;text-align:center">
          <p style="color:#94A3B8;font-size:12px;margin:0">© 2026 SCA EMS — Lovely Professional University</p>
          <p style="color:#94A3B8;font-size:12px;margin:4px 0 0">This is an automated email. Do not reply.</p>
        </div>
      </div>
    `,
  })
}

export const sendRejectionEmail = async ({ to, firstName, reason, referenceNumber }) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: '⚠️ SCA EMS Application Update — Action Required',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
        <div style="background:#1E3A5F;padding:24px;text-align:center">
          <h2 style="color:white;margin:0">SCA Event Management System</h2>
          <p style="color:#93C5FD;margin:4px 0 0">School of Computer Applications, LPU</p>
        </div>
        <div style="padding:40px;background:#fff">
          <h1 style="font-size:22px;color:#0F172A;text-align:center">Application Update</h1>
          <p style="color:#475569">Hi ${firstName},</p>
          <p style="color:#475569">We were unable to approve your application at this time. Please see the reason below:</p>
          <div style="background:#FEF2F2;border:1px solid #FCA5A5;border-left:4px solid #EF4444;border-radius:8px;padding:16px;margin:20px 0">
            <p style="color:#991B1B;margin:0;font-style:italic">"${reason}"</p>
          </div>
          <p style="color:#475569"><strong>What to do next:</strong></p>
          <ol style="color:#475569">
            <li>Review the reason above</li>
            <li>Prepare the correct documents</li>
            <li>Re-apply at the signup page</li>
          </ol>
          <a href="${process.env.FRONTEND_URL}/signup" style="display:block;background:#DC2626;color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600">Re-Apply Now →</a>
          <p style="color:#94A3B8;font-size:12px;margin-top:24px">Reference: ${referenceNumber} | Contact: sca@lpu.edu.in</p>
        </div>
        <div style="background:#F8FAFC;padding:16px;text-align:center">
          <p style="color:#94A3B8;font-size:12px;margin:0">© 2026 SCA EMS — Lovely Professional University</p>
        </div>
      </div>
    `,
  })
}
```

---

## STEP 9 — ROUTING SETUP

### frontend/src/routes/index.jsx
```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

// Public pages
import Landing       from '../pages/public/Landing'
import About         from '../pages/public/About'
import Team          from '../pages/public/Team'
import Contact       from '../pages/public/Contact'

// Auth pages
import Portal        from '../pages/auth/Portal'
import ForcePassword from '../pages/auth/ForcePassword'
import Pending       from '../pages/auth/Pending'

// Signup wizard
import RoleSelect      from '../pages/signup/RoleSelect'
import StudentDetails  from '../pages/signup/StudentDetails'
import FacultyDetails  from '../pages/signup/FacultyDetails'
import DocumentUpload  from '../pages/signup/DocumentUpload'

// Role dashboards (lazy-loaded for performance)
import { lazy, Suspense } from 'react'
const StudentDashboard   = lazy(() => import('../pages/student/Dashboard'))
const FacultyDashboard   = lazy(() => import('../pages/faculty/Dashboard'))
const AdminDashboard     = lazy(() => import('../pages/admin/Dashboard'))
const SuperadminDashboard= lazy(() => import('../pages/superadmin/Dashboard'))

const router = createBrowserRouter([
  // Public
  { path: '/',          element: <Landing /> },
  { path: '/about',     element: <About /> },
  { path: '/team',      element: <Team /> },
  { path: '/contact',   element: <Contact /> },

  // Auth (redirect if already logged in)
  { path: '/portal',    element: <PublicOnlyRoute><Portal /></PublicOnlyRoute> },
  { path: '/pending',   element: <Pending /> },

  // Signup wizard
  { path: '/signup',              element: <RoleSelect /> },
  { path: '/signup/student',      element: <StudentDetails /> },
  { path: '/signup/faculty',      element: <FacultyDetails /> },
  { path: '/signup/documents',    element: <DocumentUpload /> },

  // Force password change (accessible only after login, before normal access)
  { path: '/change-password', element: <ProtectedRoute><ForcePassword /></ProtectedRoute> },

  // Student routes
  { path: '/student',           element: <ProtectedRoute role="student"><Suspense><StudentDashboard /></Suspense></ProtectedRoute> },
  { path: '/student/events',    element: <ProtectedRoute role="student"><Suspense><lazy(() => import('../pages/student/MyEvents')) /></Suspense></ProtectedRoute> },
  { path: '/student/tasks',     element: <ProtectedRoute role="student"><Suspense><lazy(() => import('../pages/student/MyTasks')) /></Suspense></ProtectedRoute> },
  { path: '/student/profile',   element: <ProtectedRoute role="student"><Suspense><lazy(() => import('../pages/student/Profile')) /></Suspense></ProtectedRoute> },

  // Faculty routes
  { path: '/faculty',               element: <ProtectedRoute role="faculty"><Suspense><FacultyDashboard /></Suspense></ProtectedRoute> },
  { path: '/faculty/events',        element: <ProtectedRoute role="faculty"><Suspense><lazy(() => import('../pages/faculty/MyEvents')) /></Suspense></ProtectedRoute> },
  { path: '/faculty/events/create', element: <ProtectedRoute role="faculty"><Suspense><lazy(() => import('../pages/faculty/CreateEvent')) /></Suspense></ProtectedRoute> },
  { path: '/faculty/events/:id/edit', element: <ProtectedRoute role="faculty"><Suspense><lazy(() => import('../pages/faculty/EditEvent')) /></Suspense></ProtectedRoute> },
  { path: '/faculty/tasks',         element: <ProtectedRoute role="faculty"><Suspense><lazy(() => import('../pages/faculty/MyTasks')) /></Suspense></ProtectedRoute> },
  { path: '/faculty/profile',       element: <ProtectedRoute role="faculty"><Suspense><lazy(() => import('../pages/faculty/Profile')) /></Suspense></ProtectedRoute> },

  // Admin routes
  { path: '/admin',               element: <ProtectedRoute role={['admin','superadmin']}><Suspense><AdminDashboard /></Suspense></ProtectedRoute> },
  { path: '/admin/events',        element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/AllEvents')) /></Suspense></ProtectedRoute> },
  { path: '/admin/users',         element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/ManageUsers')) /></Suspense></ProtectedRoute> },
  { path: '/admin/verify',        element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/VerifyUsers')) /></Suspense></ProtectedRoute> },
  { path: '/admin/verify/:id',    element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/VerifyUserDetail')) /></Suspense></ProtectedRoute> },
  { path: '/admin/contact',       element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/ContactQueries')) /></Suspense></ProtectedRoute> },
  { path: '/admin/tasks',         element: <ProtectedRoute role={['admin','superadmin']}><Suspense><lazy(() => import('../pages/admin/MyTasks')) /></Suspense></ProtectedRoute> },

  // Superadmin
  { path: '/superadmin',         element: <ProtectedRoute role="superadmin"><Suspense><SuperadminDashboard /></Suspense></ProtectedRoute> },
  { path: '/superadmin/profile', element: <ProtectedRoute role="superadmin"><Suspense><lazy(() => import('../pages/superadmin/Profile')) /></Suspense></ProtectedRoute> },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
```

### frontend/src/routes/ProtectedRoute.jsx
```jsx
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/portal" replace />

  // Force password change if required
  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Role check
  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user.role)) {
      return <Navigate to={`/${user.role}`} replace />
    }
  }

  return children
}
```

---

## STEP 10 — COMPLETE API ENDPOINT MAP

### Auth
```
POST /api/auth/login              → login (captcha required) [authLimiter]
POST /api/auth/logout             → logout (clear Firebase session)
POST /api/auth/change-password    → force change on first login [auth required]
```

### Signup + Verification
```
POST /api/auth/signup             → step 1+2: create User (unverified) [signupLimiter + captcha]
POST /api/verification/submit     → step 3: upload docs, create VerificationApplication [uploadLimiter]
GET  /api/verification/status/:ref → check own application status (public with ref number)
GET  /api/verification            → [admin] list all applications with filters
GET  /api/verification/:id        → [admin] get single application detail
PATCH /api/verification/:id/approve → [admin] approve + send email
PATCH /api/verification/:id/reject  → [admin] reject with reason + send email
```

### Users (admin/superadmin only)
```
GET    /api/users                 → list users by role
POST   /api/users                 → create user account (admin-created)
DELETE /api/users/:id             → delete user
PATCH  /api/users/:id/deactivate  → deactivate without deleting
```

### Events
```
GET    /api/events                → list (filtered by role: own events vs all)
POST   /api/events                → create [faculty+]
GET    /api/events/:id            → get single event
PATCH  /api/events/:id            → update [creator or admin]
DELETE /api/events/:id            → delete [admin+]
PATCH  /api/events/:id/approve    → [admin+]
PATCH  /api/events/:id/reject     → [admin+]
POST   /api/events/:id/students   → assign student [faculty+]
DELETE /api/events/:id/students/:studentId → remove student
```

### Todos
```
GET    /api/todos?eventId=         → list todos for event
POST   /api/todos                  → create todo [faculty+]
PATCH  /api/todos/:id              → update todo [faculty+]
DELETE /api/todos/:id              → delete [faculty+]
POST   /api/todos/:id/complete     → mark complete [student: own, faculty: any]
```

### Tasks (personal)
```
GET    /api/tasks                  → own tasks
POST   /api/tasks                  → create own task
PATCH  /api/tasks/:id              → update
DELETE /api/tasks/:id              → delete
PATCH  /api/tasks/:id/toggle       → toggle done/undone
```

### Contact
```
POST /api/contact                  → submit query [contactLimiter + captcha]
GET  /api/contact                  → [admin+] list queries
GET  /api/contact/:id              → [admin+] single query
PATCH /api/contact/:id/read        → [admin+] mark as read
DELETE /api/contact/:id            → [admin+] delete
```

---

## STEP 11 — START SCRIPTS

### backend/package.json scripts:
```json
{
  "type": "module",
  "scripts": {
    "dev":   "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### frontend/package.json scripts:
```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  }
}
```

### Run both in separate terminals:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Backend runs on: http://localhost:4000
Frontend runs on: http://localhost:5173

---

## STEP 12 — THIRD-PARTY SERVICE SETUP CHECKLIST

Do these before writing any business logic:

### 1. Firebase (10 minutes)
- [ ] Go to console.firebase.google.com
- [ ] Create project "sca-ems"
- [ ] Enable Authentication → Email/Password provider
- [ ] Add Web App → copy firebaseConfig → paste in frontend .env.local
- [ ] Go to Project Settings → Service Accounts → Generate new private key → save JSON
- [ ] Extract PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY → paste in backend .env

### 2. MongoDB Atlas (5 minutes)
- [ ] Go to cloud.mongodb.com → Create free M0 cluster
- [ ] Create database user with password
- [ ] Allow network access from anywhere (0.0.0.0/0) for dev
- [ ] Get connection string → replace <user> and <password> → paste in backend .env

### 3. Cloudinary (5 minutes)
- [ ] Go to cloudinary.com → Sign up free
- [ ] Dashboard → copy Cloud Name, API Key, API Secret → paste in backend .env
- [ ] Create two upload presets: "sca_id_cards" and "sca_photos" (unsigned, for dev)

### 4. Brevo Email (5 minutes)
- [ ] Go to app.brevo.com → Sign up free
- [ ] Go to SMTP & API → SMTP
- [ ] Copy SMTP credentials → paste in backend .env
- [ ] Add and verify your sender domain or email

### 5. hCaptcha (3 minutes)
- [ ] Go to hcaptcha.com → Sign up free
- [ ] Add your site (localhost for dev)
- [ ] Copy Site Key → paste in frontend .env.local
- [ ] Copy Secret Key → paste in backend .env

---

## IMPORTANT NOTES FOR TRAE

1. Use ES Modules (import/export) throughout — both frontend and backend
2. Never commit .env or .env.local files — they are gitignored
3. The Firebase private key contains \n characters — in .env wrap it in double quotes
4. All API responses must follow ApiResponse format: { success, message, data }
5. All errors must go through errorHandler middleware — never send raw errors to client
6. Validate EVERY request body on the backend with Joi, even if frontend validates with Zod
7. The hCaptcha token must be verified server-side on: login, signup, and contact form submit
8. Document uploads go to Cloudinary — never save files to disk in production
9. The sidebar nav items are role-specific — render conditionally based on Zustand authStore role
10. Dark mode is toggled via class on <html> tag and persisted in localStorage

