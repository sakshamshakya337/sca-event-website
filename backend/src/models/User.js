import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin', 'superadmin'],
    required: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  personalEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  officialEmail: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, select: false },
  mustChangePassword: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Student-only fields
  registrationNumber: { type: String, trim: true, uppercase: true, sparse: true },
  program: String,
  degree: String,
  semester: String,
  section: String,

  // Faculty-only fields
  employeeId: { type: String, trim: true, uppercase: true, sparse: true },
  department: String,
  designation: String,

  // Profile
  profilePhotoUrl: String,
  profilePhotoPublicId: String,

  // Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  passwordChangedAt: Date,

  // Security question for password reset
  securityQuestion: { type: String, trim: true },
  securityAnswer: { type: String, select: false }, // stored as lowercase hash

  // Password reset token (short-lived OTP stored as hash)
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date },

}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordChangedAt = new Date()
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Indexes
userSchema.index({ registrationNumber: 1 }, { unique: true, sparse: true })
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true })
userSchema.index({ personalEmail: 1 }, { unique: true })
userSchema.index({ officialEmail: 1 }, { unique: true, sparse: true })
userSchema.index({ role: 1, isVerified: 1 })

export default mongoose.model('User', userSchema)
