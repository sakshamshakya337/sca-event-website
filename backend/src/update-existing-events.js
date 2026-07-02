import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import Event model
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Workshop', 'Seminar', 'Cultural', 'Sports', 'Technical', 'Other'], required: true },
  date: { type: Date, required: true },
  time: String,
  venue: { type: String, required: true, trim: true },
  expectedAudience: Number,
  description: String,
  registerLink: { type: String, trim: true },
  registrationNotRequired: { type: Boolean, default: false },
  registrationOpen: { type: Boolean, default: false },
  imageUrl: String,
  imagePublicId: String,
  gallery: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
  externalImageUrls: { type: [String], default: [], validate: { validator: (arr) => arr.length <= 10, message: 'Maximum 10 external image URLs allowed.' } },
  isImportant: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedReason: String,
  assignedFaculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })
const Event = mongoose.model('Event', eventSchema)

async function updateEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Update all existing events to set externalImageUrls to empty array if not present
    const result = await Event.updateMany(
      { externalImageUrls: { $exists: false } },
      { $set: { externalImageUrls: [] } }
    )

    console.log(`Successfully updated ${result.modifiedCount} events`)

    // Also update any events where externalImageUrls is not an array
    const result2 = await Event.updateMany(
      { externalImageUrls: { $not: { $type: 'array' } } },
      { $set: { externalImageUrls: [] } }
    )
    console.log(`Fixed ${result2.modifiedCount} events with invalid externalImageUrls`)

    mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error updating events:', error)
    mongoose.disconnect()
    process.exit(1)
  }
}

updateEvents()