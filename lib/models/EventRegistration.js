// lib/models/EventRegistration.js
import mongoose from 'mongoose'

const eventRegistrationSchema = new mongoose.Schema({
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // Existing fields
  registrationNumber: { type: String, trim: true, uppercase: true },
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  course: { type: String, trim: true },
  section: { type: String, trim: true },
  school: { type: String, default: 'School of Computer Applications' },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true },

  // Payment details (populated if paid event)
  paymentStatus: {
    type: String,
    enum: ['free', 'pending', 'paid', 'failed', 'refunded'],
    default: 'free',
  },
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  amountPaid:        { type: Number, default: 0 },
  
  // Attendance
  attended:   { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },

  // Certificate issued
  certificateIssued: { type: Boolean, default: false },

}, { timestamps: true })

// Indexes
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true })
eventRegistrationSchema.index({ event: 1, registrationNumber: 1 }, { unique: true, sparse: true })
eventRegistrationSchema.index({ event: 1, paymentStatus: 1 })

export default mongoose.models.EventRegistration || mongoose.model('EventRegistration', eventRegistrationSchema)
