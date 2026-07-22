import mongoose from 'mongoose'

// Serverless-safe connection: cache the promise on globalThis so warm
// invocations reuse the same MongoDB connection instead of reconnecting.
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!globalThis.__mongoosePromise) {
    globalThis.__mongoosePromise = mongoose
      .connect(process.env.MONGODB_URI, {
        // Connection pool — keep enough connections alive to handle concurrent requests
        maxPoolSize: 10,
        minPoolSize: 2,

        // Fail fast if Atlas is unreachable (5 s instead of default 30 s)
        serverSelectionTimeoutMS: 5000,

        // Kill stale sockets quickly
        socketTimeoutMS: 10000,
        connectTimeoutMS: 10000,

        // Heartbeat — detect dead connections before they cause 30 s hangs
        heartbeatFrequencyMS: 10000,

        // Atlas recommends this for retryable writes
        retryWrites: true,
        w: 'majority',
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
