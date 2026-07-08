// backend/src/config/mailer.js
import nodemailer from 'nodemailer'

// Create transporter as a function so it reads env vars
// at call time (after dotenv has loaded), not at import time
export const createTransporter = () => {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error(
      `Gmail credentials missing.\n` +
      `GMAIL_USER: ${user ? '✅ set' : '❌ undefined'}\n` +
      `GMAIL_APP_PASSWORD: ${pass ? '✅ set' : '❌ undefined'}\n` +
      `Fix: Add both variables to your .env file and restart the server.`
    )
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: true,
    maxConnections: 5,
    socketTimeout: 30000,
    connectionTimeout: 30000,
  })
}

// Call this in server.js after dotenv.config() to verify on startup
export const verifyMailer = async () => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log(`✅ Gmail SMTP ready — ${process.env.GMAIL_USER}`)
  } catch (err) {
    console.error('❌ Gmail SMTP error:', err.message)
  }
}
