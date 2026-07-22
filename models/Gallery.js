import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the gallery'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: { type: String, unique: true, trim: true },
  content: {
    type: String,
    required: [true, 'Please provide content for the event report']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide the event start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide the event end date']
  },
  bannerImage: {
    type: String,
    required: [true, 'Please provide a banner image URL']
  },
  images: [{
    type: String,
    required: true
  }],

  // Approval Workflow Fields
  facultyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  departmentCode: { type: String, trim: true, uppercase: true },
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  currentApprover: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  status: {
    type: String,
    enum: ['draft', 'pending_hod', 'pending_hos', 'published', 'rejected'],
    default: 'draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,

  // Kept for backward compatibility or generic usage
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Generate slug from title before saving
gallerySchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    // import slugify dynamically or just use simple regex for now since we don't have it imported here. Wait, event.js has it imported. Let's just assume we will import it.
    let baseSlug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    
    let newSlug = baseSlug
    let counter = 1
    const GalleryModel = mongoose.model('Gallery')
    while (await GalleryModel.exists({ slug: newSlug, _id: { $ne: this._id } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }
    this.slug = newSlug
  }
  next()
})

export default mongoose.model('Gallery', gallerySchema)
