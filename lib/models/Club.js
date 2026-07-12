// lib/models/Club.js
import mongoose from 'mongoose'

const clubSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  // e.g. "TechNova", "CodeCraft", "AI Club"
  
  slug:        { type: String, unique: true, lowercase: true },
  // e.g. "technova", "codecraft"

  description: { type: String },
  logoUrl:     { type: String },

  // Leadership — student roles
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  vicePresident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Faculty who coordinates/supervises this club
  facultyCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // All student members
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },

}, { timestamps: true })

clubSchema.index({ slug: 1 })
clubSchema.index({ facultyCoordinator: 1 })

export default mongoose.models.Club || mongoose.model('Club', clubSchema)
