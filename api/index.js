// Single Vercel Serverless Function entry point.
// Imports the existing Express app (which already has every route mounted)
// and serves ALL /api/* requests through it. This avoids deploying one
// function per route and the 12-function limit entirely.

// On Vercel, env vars are injected by the platform. But when running
// locally via `vercel dev`, dotenv is needed to load .env files.
// This import is safe to call multiple times (idempotent).
import 'dotenv/config'

import app from '../app.js'

export default app
