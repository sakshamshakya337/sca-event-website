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
  registrationNumber: { type: String, trim: true, uppercase: true },
  program: String,
  degree: String,
  semester: String,
  section: String,

  // Faculty-only fields
  employeeId: { type: String, trim: true, uppercase: true },
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
userSchema.index({ registrationNumber: 1 })
userSchema.index({ employeeId: 1 })
userSchema.index({ personalEmail: 1 })
userSchema.index({ role: 1, isVerified: 1 })

export default mongoose.model('User', userSchema)
