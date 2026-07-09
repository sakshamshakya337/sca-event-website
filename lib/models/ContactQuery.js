import mongoose from 'mongoose'

const contactQuerySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  universityId: { type: String, trim: true },
  role: { type: String, trim: true, default: 'Student' },
  category: { type: String, trim: true, default: 'General' },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  response: String,
}, { timestamps: true })

contactQuerySchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('ContactQuery', contactQuerySchema)
