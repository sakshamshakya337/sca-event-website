import mongoose from 'mongoose'

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // Each registration number is unique per event
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: String,
      default: 'School of Computer Applications',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

// One registration per student per event
eventRegistrationSchema.index({ event: 1, registrationNumber: 1 }, { unique: true })
eventRegistrationSchema.index({ event: 1 })

export default mongoose.model('EventRegistration', eventRegistrationSchema)
