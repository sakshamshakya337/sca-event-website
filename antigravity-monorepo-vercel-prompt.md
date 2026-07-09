# ANTIGRAVITY PROMPT — Migrate SCA EMS to Single Repo + Vercel Serverless
# Task: Convert monorepo (frontend/ + backend/) → single root folder with Vercel Serverless Functions
# Stack: React 18 + Vite + TailwindCSS + Express → Vercel Functions + MongoDB Atlas + Gmail SMTP

---

## CONTEXT

Current structure (what we have now):
```
sca-ems/
├── frontend/          ← React 18 + Vite + TailwindCSS
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── backend/           ← Express + MongoDB + Nodemailer
    ├── src/
    │   ├── server.js
    │   ├── app.js
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── services/
    └── package.json
```

Target structure (what we want):
```
sca-ems/                          ← single root, one git repo, one Vercel project
├── api/                          ← Vercel Serverless Functions (replaces backend/src/)
│   ├── auth/
│   │   ├── login.js
│   │   ├── logout.js
│   │   └── forgot-password/
│   │       ├── question.js
│   │       ├── verify.js
│   │       └── reset.js
│   ├── events/
│   │   ├── index.js              ← GET all, POST create
│   │   └── [id]/
│   │       ├── index.js          ← GET one, PATCH update, DELETE
│   │       ├── approve.js
│   │       ├── reject.js
│   │       └── students.js
│   ├── users/
│   │   ├── index.js
│   │   └── [id].js
│   ├── upload/
│   │   ├── profile.js
│   │   └── documents.js
│   ├── contact/
│   │   └── index.js
│   ├── verification/
│   │   ├── index.js
│   │   ├── submit.js
│   │   └── [id]/
│   │       ├── approve.js
│   │       └── reject.js
│   ├── todos/
│   │   └── index.js
│   └── tasks/
│       └── index.js
├── src/                          ← React frontend (moved from frontend/src/)
├── public/                       ← Static assets
├── lib/                          ← Shared backend utilities used by all api/ functions
│   ├── db.js                     ← MongoDB connection (shared singleton)
│   ├── auth.js                   ← Token verification middleware logic
│   ├── emailService.js           ← Gmail SMTP sender
│   ├── cloudinary.js             ← Cloudinary upload helpers
│   ├── captcha.js                ← hCaptcha verifier
│   ├── response.js               ← ApiResponse + ApiError helpers
│   └── models/                   ← Mongoose models (shared across all functions)
│       ├── User.js
│       ├── Event.js
│       ├── Todo.js
│       ├── Task.js
│       ├── ContactQuery.js
│       └── VerificationApplication.js
├── index.html
├── package.json                  ← single package.json with ALL deps (frontend + backend)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json                   ← Vercel config routing frontend + api
└── .env                          ← single .env file at root
```

---

## TASK — DO THIS IN EXACT ORDER

---

### STEP 1 — Create the new folder structure at project root

Create these folders at the ROOT of the project (same level as the old frontend/ and backend/):
```
mkdir api
mkdir api/auth
mkdir api/auth/forgot-password
mkdir api/events
mkdir "api/events/[id]"
mkdir api/users
mkdir "api/users/[id]"
mkdir api/upload
mkdir api/contact
mkdir api/verification
mkdir "api/verification/[id]"
mkdir api/todos
mkdir api/tasks
mkdir lib
mkdir lib/models
```

---

### STEP 2 — Move frontend files to root

Move everything INSIDE `frontend/` up to the project root:
- `frontend/src/` → `src/`
- `frontend/public/` → `public/`
- `frontend/index.html` → `index.html`
- `frontend/vite.config.js` → `vite.config.js`
- `frontend/tailwind.config.js` → `tailwind.config.js`
- `frontend/postcss.config.js` → `postcss.config.js`

Do NOT delete the files — copy/move them.

---

### STEP 3 — Create single root package.json

Create a NEW `package.json` at the project root that combines ALL dependencies
from both `frontend/package.json` and `backend/package.json`:

```json
{
  "name": "sca-ems",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.0",
    "firebase": "^10.12.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.383.0",
    "react-dropzone": "^14.2.3",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "@hcaptcha/react-hcaptcha": "^1.11.0",
    "mongoose": "^8.5.0",
    "firebase-admin": "^12.3.0",
    "nodemailer": "^6.9.14",
    "cloudinary": "^2.4.0",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.4.0",
    "uuid": "^10.0.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.4.21"
  }
}
```

Run `npm install` after creating this file.

---

### STEP 4 — Move backend shared code to lib/

Copy these files from `backend/src/` to `lib/`:

**lib/db.js** — MongoDB connection singleton
Copy from `backend/src/config/db.js` and update the import paths.
The key pattern for Vercel serverless is a cached connection:

```javascript
// lib/db.js
import mongoose from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
```

WHY: Vercel serverless functions are stateless. Without this singleton pattern,
every API call would open a NEW MongoDB connection, exhausting your Atlas free tier
limit of 500 connections in minutes. This pattern reuses existing connections.

**lib/response.js** — API response helpers
```javascript
// lib/response.js
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.success = false
  }
}

export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}
```

**lib/auth.js** — Firebase token verifier
```javascript
// lib/auth.js
import admin from 'firebase-admin'

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const verifyToken = async (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }
  const token = authHeader.split('Bearer ')[1]
  return admin.auth().verifyIdToken(token)
}

export const getUser = async (req, User) => {
  const decoded = await verifyToken(req)
  const user = await User.findOne({ firebaseUid: decoded.uid })
  if (!user) throw new Error('User not found')
  if (!user.isActive) throw new Error('Account deactivated')
  return user
}
```

**lib/emailService.js** — Copy from `backend/src/services/emailService.js` exactly.
No changes needed — it already uses `createTransporter()` pattern.

**lib/cloudinary.js** — Copy from `backend/src/services/cloudinaryService.js`.

**lib/captcha.js** — Copy from `backend/src/services/captchaService.js`.

**lib/models/** — Copy ALL model files from `backend/src/models/` into `lib/models/`.
- `backend/src/models/User.js` → `lib/models/User.js`
- `backend/src/models/Event.js` → `lib/models/Event.js`
- `backend/src/models/Todo.js` → `lib/models/Todo.js`
- `backend/src/models/Task.js` → `lib/models/Task.js`
- `backend/src/models/ContactQuery.js` → `lib/models/ContactQuery.js`
- `backend/src/models/VerificationApplication.js` → `lib/models/VerificationApplication.js`

Update import paths in each model if they reference other files.

---

### STEP 5 — Convert each Express route to a Vercel Serverless Function

Every file in `api/` must export a DEFAULT async function that takes `(req, res)`.
No Express app needed — Vercel provides the req/res directly.

**PATTERN — every api/ file follows this exact structure:**

```javascript
// api/[route]/[action].js
import { connectDB } from '../../lib/db.js'
import { ApiError, ApiResponse } from '../../lib/response.js'

export default async function handler(req, res) {
  // 1. Set CORS headers on every response
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 2. Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // 3. Connect to MongoDB
    await connectDB()

    // 4. Your logic here
    // ...

    return res.status(200).json(new ApiResponse(200, data, 'Success'))

  } catch (err) {
    const status = err instanceof ApiError ? err.statusCode : 500
    return res.status(status).json({
      success: false,
      message: err.message || 'Internal server error',
    })
  }
}
```

**NOW CREATE EACH API FILE:**

---

**api/auth/login.js**
Convert from `backend/src/controllers/authController.js` → `login` function.
Method: POST only. Verify captcha → find user → verify password → return user object.

```javascript
import { connectDB } from '../../lib/db.js'
import User from '../../lib/models/User.js'
import { verifyCaptcha } from '../../lib/captcha.js'
import { ApiError, ApiResponse } from '../../lib/response.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  try {
    await connectDB()

    const { identifier, password, captchaToken } = req.body

    if (!identifier || !password || !captchaToken) {
      throw new ApiError(400, 'All fields are required')
    }

    const captchaOk = await verifyCaptcha(captchaToken)
    if (!captchaOk) throw new ApiError(400, 'Captcha verification failed')

    const isRegNumber = /^\d{8}$/.test(identifier.trim())
    const query = isRegNumber
      ? { registrationNumber: identifier.trim().toUpperCase() }
      : { $or: [{ officialEmail: identifier.trim().toLowerCase() }, { personalEmail: identifier.trim().toLowerCase() }] }

    const user = await User.findOne(query).select('+password')
    if (!user) throw new ApiError(401, 'Incorrect credentials')

    const match = await user.comparePassword(password)
    if (!match) throw new ApiError(401, 'Incorrect credentials')

    if (user.verificationStatus === 'pending') throw new ApiError(403, 'Account pending verification')
    if (user.verificationStatus === 'rejected') throw new ApiError(403, 'Application rejected')
    if (!user.isActive) throw new ApiError(403, 'Account deactivated')

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        mustChangePassword: user.mustChangePassword,
        isVerified: user.isVerified,
        registrationNumber: user.registrationNumber || null,
        officialEmail: user.officialEmail || null,
        profilePhotoUrl: user.profilePhotoUrl || null,
      }
    }, 'Login successful'))

  } catch (err) {
    const status = err instanceof ApiError ? err.statusCode : 500
    return res.status(status).json({ success: false, message: err.message })
  }
}
```

---

**api/auth/forgot-password/question.js**
Convert `getSecurityQuestion` from `backend/src/controllers/passwordResetController.js`.

**api/auth/forgot-password/verify.js**
Convert `requestPasswordReset` — this is where Gmail SMTP is called.

**api/auth/forgot-password/reset.js**
Convert `resetPassword`.

**api/events/index.js**
Handle GET (list events) and POST (create event).
Use `req.method` to switch between GET and POST in the same file.

```javascript
// Example pattern for GET + POST in same file
export default async function handler(req, res) {
  // ... CORS headers ...
  await connectDB()

  if (req.method === 'GET') {
    // list events logic
  } else if (req.method === 'POST') {
    // create event logic
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
```

**api/events/[id]/index.js**
Handle GET (single), PATCH (update), DELETE.
Access dynamic ID with `req.query.id`.

**api/events/[id]/approve.js** — PATCH only
**api/events/[id]/reject.js** — PATCH only
**api/events/[id]/students.js** — POST (assign) + DELETE (remove)
**api/users/index.js** — GET list + POST create user
**api/users/[id].js** — DELETE + PATCH deactivate
**api/upload/profile.js** — POST (handle with formidable for file parsing)
**api/upload/documents.js** — POST
**api/contact/index.js** — GET list + POST submit
**api/verification/index.js** — GET queue
**api/verification/submit.js** — POST submit docs
**api/verification/[id]/approve.js** — PATCH
**api/verification/[id]/reject.js** — PATCH
**api/todos/index.js** — GET + POST
**api/tasks/index.js** — GET + POST

Convert ALL controllers from `backend/src/controllers/` following the same pattern.
Copy the logic exactly — only change: remove Express middleware calls, add CORS headers,
use `req.query.id` instead of `req.params.id`, use `await connectDB()` at the top.

---

**api/upload/profile.js** — Special case: file upload in serverless

Vercel serverless functions do NOT support multer. Use `formidable` instead:

```javascript
import { connectDB } from '../../lib/db.js'
import { getUser } from '../../lib/auth.js'
import { uploadToCloudinary } from '../../lib/cloudinary.js'
import User from '../../lib/models/User.js'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false },  // REQUIRED for file uploads
}

export default async function handler(req, res) {
  // ... CORS headers ...
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await connectDB()
    const user = await getUser(req, User)

    // Parse form data with formidable
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [, files] = await form.parse(req)
    const file = files.image?.[0]
    if (!file) throw new Error('No file uploaded')

    const fileBuffer = fs.readFileSync(file.filepath)

    if (user.profilePhotoPublicId) {
      await deleteFromCloudinary(user.profilePhotoPublicId)
    }

    const result = await uploadToCloudinary(fileBuffer, {
      folder: 'sca-ems/profiles',
      public_id: `profile_${user._id}`,
      overwrite: true,
    })

    user.profilePhotoUrl = result.secure_url
    user.profilePhotoPublicId = result.public_id
    await user.save({ validateBeforeSave: false })

    return res.status(200).json({ success: true, data: { photoUrl: result.secure_url } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
```

Add formidable to dependencies: `npm install formidable`

---

### STEP 6 — Create vercel.json at project root

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel:
- Any request to `/api/*` → run the serverless function in `api/` folder
- Everything else → serve `index.html` (React SPA routing)

---

### STEP 7 — Update vite.config.js

```javascript
// vite.config.js — at project root
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Dev proxy — routes /api requests to Vercel dev server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

---

### STEP 8 — Create single .env at project root

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Client (Vite prefix required)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gmail SMTP
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
MAIL_FROM_NAME=SCA Event Management System

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# hCaptcha
VITE_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=

# App
FRONTEND_URL=https://sca-event-website.vercel.app
```

---

### STEP 9 — Update frontend API calls

In `src/config/axios.js`, the baseURL must change:

```javascript
// src/config/axios.js
import axios from 'axios'
import { auth } from './firebase'

const axiosInstance = axios.create({
  // In same-origin deployment, use relative URL — no need for full domain
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance
```

WHY: Since frontend and backend are now on the same domain (`sca-event-website.vercel.app`),
you can use `/api` as a relative path instead of `https://your-backend.render.com/api`.
This also eliminates ALL CORS issues because same origin = no CORS.

---

### STEP 10 — Local development with Vercel CLI

Install Vercel CLI to run both frontend and serverless functions locally:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` runs:
- Vite dev server for the frontend
- Serverless functions locally at `/api/*`
- Both on port 3000

Do NOT use `npm run dev` anymore for local development after this migration.
Use `vercel dev` instead.

---

### STEP 11 — Deploy to Vercel

```bash
# First time
vercel

# Production deploy
vercel --prod
```

Add ALL environment variables from `.env` to Vercel dashboard:
Vercel Dashboard → Project → Settings → Environment Variables → Add each one.

IMPORTANT: `FIREBASE_PRIVATE_KEY` contains `\n` characters.
In Vercel dashboard, paste the value WITH the literal `\n` — do NOT press Enter.
The `lib/auth.js` already handles this with `.replace(/\\n/g, '\n')`.

---

### STEP 12 — Delete old folders (AFTER verifying everything works)

Only after confirming the new structure works:
```bash
# Only delete after testing deployment works
rm -rf frontend/
rm -rf backend/
```

---

## WHY THIS WORKS FOR GMAIL SMTP

Gmail SMTP works in Vercel Serverless because:
1. Serverless functions run in Node.js on Vercel's servers — NOT in the browser
2. Vercel's servers can connect to Gmail's SMTP on port 465
3. Environment variables set in Vercel dashboard are available as `process.env`
4. No port blocking (unlike some ISPs that block port 587)

Your previous project worked for the same reason — same environment.

---

## CRITICAL RULES

1. Every `api/` file exports a DEFAULT function — no named exports
2. Every `api/` file adds CORS headers at the top before any logic
3. Every `api/` file calls `await connectDB()` before any DB query
4. Use `req.query.id` for dynamic route params (NOT `req.params.id`)
5. Use `req.body` for POST body (Vercel auto-parses JSON)
6. For file uploads, add `export const config = { api: { bodyParser: false } }`
7. The `lib/db.js` singleton pattern is MANDATORY — prevents connection exhaustion
8. Firebase Admin must check `if (!admin.apps.length)` before initializing
9. All model imports must point to `lib/models/` not `backend/src/models/`
10. `VITE_` prefix is required for ALL frontend env vars — backend vars have no prefix
11. Run `vercel dev` locally — NOT `npm run dev` after migration
12. Do NOT delete `frontend/` and `backend/` until the Vercel deployment is confirmed working

