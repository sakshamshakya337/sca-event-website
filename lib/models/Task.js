import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  dueDate: Date,
  notes: String,
  isDone: { type: Boolean, default: false },
  doneAt: Date,
}, { timestamps: true })

taskSchema.index({ assignedTo: 1, isDone: 1 })

export default mongoose.model('Task', taskSchema)
