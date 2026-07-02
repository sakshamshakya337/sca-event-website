import mongoose from 'mongoose'
import slugify from 'slugify'

const eventSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  slug:             { type: String, unique: true, trim: true }, // URL-friendly slug
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

// Generate slug from title + date before saving
eventSchema.pre('save', async function(next) {
  // Ensure externalImageUrls is always an array
  if (!this.externalImageUrls || !Array.isArray(this.externalImageUrls)) {
    this.externalImageUrls = []
  }

  // Generate slug only if it's new or title/date changed
  if (this.isModified('title') || this.isModified('date') || !this.slug) {
    // Format date as ddmmyy (e.g., 030726)
    const dateObj = new Date(this.date)
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0') // months are 0-based
    const year = String(dateObj.getFullYear()).slice(-2) // last 2 digits
    const dateSlug = `${day}${month}${year}`

    // Generate base slug from title
    let baseSlug = slugify(this.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })

    // Combine title slug and date slug
    let newSlug = `${baseSlug}-${dateSlug}`

    // Check for uniqueness (add counter if needed)
    let counter = 1
    const EventModel = mongoose.model('Event')
    while (await EventModel.exists({ slug: newSlug, _id: { $ne: this._id } })) {
      newSlug = `${baseSlug}-${dateSlug}-${counter}`
      counter++
    }

    this.slug = newSlug
  }

  next()
})

eventSchema.index({ status: 1, date: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model('Event', eventSchema)
