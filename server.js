import './config/env.js'

//dns for mongodb ( don't remove it anyhow)
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

import app from './app.js'
import connectDB from './config/db.js'
import { verifyMailer } from './config/mailer.js'

const PORT = process.env.PORT || 3000

const startServer = async () => {
  // Connect to DB asynchronously (non-blocking)
  connectDB().catch(error => {
    console.error('❌ MongoDB Connection setup failed:', error.message)
  })

  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    console.log(`📧 Gmail user: ${process.env.GMAIL_USER || '❌ NOT SET'}`)

    try {
      await verifyMailer()
    } catch (error) {
      console.error('❌ Mailer verification failed on startup:', error.message)
    }
  })
}

startServer()
