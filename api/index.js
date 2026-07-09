// Single Vercel Serverless Function entry point.
// Imports the existing Express app (which already has every route mounted)
// and serves ALL /api/* requests through it. This avoids deploying one
// function per route and the 12-function limit entirely.
import app from '../app.js'

export default app
