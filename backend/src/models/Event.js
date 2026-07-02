import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Cultural', 'Sports', 'Technical', 'Other'],
    required: true,
  },
  date:             { type: Date, required: true },
  time:             String,
  venue:            { type: String, required: true, trim: true },
  expectedAudience: Number,
  description:      String,
  registerLink:     { type: String, trim: true },

  // Registration controls
  registrationNotRequired: { type: Boolean, default: false },
  registrationOpen:        { type: Boolean, default: false },

  // Images
  imageUrl:      String,
  imagePublicId: String,
  gallery: [
    {
      url:      { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
  // Up to 10 external image URLs (paste from Cloudinary, ImageBB, etc.)
  externalImageUrls: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 10,
      message:   'Maximum 10 external image URLs allowed.',
    },
  },

  isImportant: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },

  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:     Date,
  rejectedReason: String,

  assignedFaculty:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true })

// Ensure externalImageUrls is always an array before saving
eventSchema.pre('save', function(next) {
  if (!this.externalImageUrls || !Array.isArray(this.externalImageUrls)) {
    this.externalImageUrls = []
  }
  next()
})

eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model('Event', eventSchema)
