import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
})

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mail transporter error:', error)
  } else {
    console.log('✅ Mail transporter ready (Brevo SMTP)')
  }
})
