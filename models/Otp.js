import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true })

// Automatically delete document when expiresAt timestamp is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
otpSchema.index({ userId: 1, isUsed: 1 })
otpSchema.index({ email: 1, isUsed: 1 })

export default mongoose.models.Otp || mongoose.model('Otp', otpSchema)
