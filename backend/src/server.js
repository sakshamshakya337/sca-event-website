// server.js — dotenv MUST be first, before any other import
import dotenv from 'dotenv'
dotenv.config()

//dns for mongodb ( don't remove it anyhow)
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import app from './app.js'
import connectDB from './config/db.js'
import { verifyMailer } from './config/mailer.js'

const PORT = process.env.PORT || 4000

const startServer = async () => {
  await connectDB()

  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    console.log(`📧 Gmail user: ${process.env.GMAIL_USER || '❌ NOT SET'}`)

    // Verify Gmail on startup so you know immediately if it's broken
    await verifyMailer()
  })
}

startServer()
