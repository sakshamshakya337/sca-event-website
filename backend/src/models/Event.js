import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Cultural', 'Sports', 'Technical', 'Other'],
    required: true
  },
  date: { type: Date, required: true },
  time: String,
  venue: { type: String, required: true, trim: true },
  expectedAudience: Number,
  description: String,
  registerLink: { type: String, trim: true },
  registrationNotRequired: { type: Boolean, default: false },
  imageUrl: String,
  imagePublicId: String,
  isImportant: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedReason: String,

  assignedFaculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true })

eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model('Event', eventSchema)
