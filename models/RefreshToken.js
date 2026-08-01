import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  family: {
    type: String,
    required: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true })

// TTL index to automatically prune expired refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
refreshTokenSchema.index({ userId: 1, family: 1 })

export default mongoose.models.RefreshToken || mongoose.model('RefreshToken', refreshTokenSchema)
