import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the gallery'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
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
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Gallery', gallerySchema)
