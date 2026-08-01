import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'ACCOUNT_VALIDATED',
      'OTP_REQUESTED',
      'OTP_FAILED',
      'OTP_VERIFIED',
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'ACCOUNT_LOCKED',
      'REFRESH_TOKEN_ROTATED',
      'LOGOUT',
      'UNAUTHORIZED_ACCESS_ATTEMPT',
    ],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  userRole: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  },
  metadata: {
    type: Object,
    default: {},
  },
}, { timestamps: true })

auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ email: 1, createdAt: -1 })

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
