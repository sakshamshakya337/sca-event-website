import mongoose from 'mongoose'

// Serverless-safe connection: cache the promise on globalThis so warm
// invocations reuse the same MongoDB connection instead of reconnecting
// on every request (important when Express runs as a single Vercel function).
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!globalThis.__mongoosePromise) {
    globalThis.__mongoosePromise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((conn) => {
        console.log(`✅ MongoDB connected: ${conn.connection.host}`)
        return conn
      })
      .catch((err) => {
        globalThis.__mongoosePromise = null
        console.error(`❌ MongoDB connection failed: ${err.message}`)
        throw err
      })
  }

  return globalThis.__mongoosePromise
}

export default connectDB
