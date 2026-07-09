import mongoose from 'mongoose'

const verificationApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceNumber: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Uploaded documents
  universityIdUrl: String,
  universityIdPublicId: String,
  profilePhotoUrl: String,
  profilePhotoPublicId: String,

  // Admin review
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  adminNotes: String,

  // Checklist (admin marks these during review)
  checklist: {
    idMatchesApplication: { type: Boolean, default: false },
    nameMatchesId: { type: Boolean, default: false },
    photoAcceptable: { type: Boolean, default: false },
    idNotExpired: { type: Boolean, default: false },
    enrolledInSca: { type: Boolean, default: false },
  },

}, { timestamps: true })

verificationApplicationSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('VerificationApplication', verificationApplicationSchema)
