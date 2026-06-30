//dns for mongodb ( don't remove it anyhow)
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// First load dotenv - guaranteed to run before any other imports!
import dotenv from 'dotenv'
dotenv.config()


const startServer = async () => {
  const app = (await import('./app.js')).default
  const connectDB = (await import('./config/db.js')).default

  const PORT = process.env.PORT || 5000

  // Connect to database
  await connectDB()

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    console.log(`☁️  Cloudinary cloud_name: ${process.env.CLOUDINARY_CLOUD_NAME}`)
  })
}

startServer()
