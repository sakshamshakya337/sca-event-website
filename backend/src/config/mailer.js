// backend/src/config/mailer.js
import nodemailer from 'nodemailer'

export const createTransporter = () => {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error(
      `Gmail credentials missing — GMAIL_USER: ${user ? '✅' : '❌'} | GMAIL_APP_PASSWORD: ${pass ? '✅' : '❌'}`
    )
  }

  // Try port 465 (SSL) — works when port 587 is blocked by ISP/firewall
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,        // true for port 465
    auth: { user, pass },
    socketTimeout: 30000,
    connectionTimeout: 30000,
  })
}

export const verifyMailer = async () => {
  try {
    const t = createTransporter()
    await t.verify()
    console.log(`✅ Gmail SMTP ready (port 465) — ${process.env.GMAIL_USER}`)
  } catch (err) {
    console.error('❌ Gmail SMTP error:', err.message)

    if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
      console.error('→ Port 465 also blocked. Try GMAIL_SMTP_PORT=2525 or use Brevo SMTP.')
    } else if (err.code === 'EAUTH') {
      console.error('→ Wrong App Password. Re-generate at myaccount.google.com/apppasswords')
    }
  }
}
