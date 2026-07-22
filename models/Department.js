import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema({
  departmentName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  departmentCode: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true 
  },
  hodIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  }
}, { timestamps: true })

export default mongoose.models.Department || mongoose.model('Department', departmentSchema)
