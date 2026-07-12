// api/clubs/index.js
import { connectDB } from '../../lib/db.js'
import { getUser } from '../../lib/auth.js'
import Club from '../../models/Club.js'
import User from '../../models/User.js'
import ApiResponse from '../../utils/ApiResponse.js'
import ApiError from '../../utils/ApiError.js'

const CORS = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()

    // GET — public list of clubs
    if (req.method === 'GET') {
      const clubs = await Club.find({ isActive: true })
        .populate('president', 'firstName lastName registrationNumber')
        .populate('vicePresident', 'firstName lastName registrationNumber')
        .populate('facultyCoordinator', 'firstName lastName designation')
        .lean()
      return res.status(200).json(new ApiResponse(200, clubs, 'Clubs fetched'))
    }

    // POST — create club (superadmin only)
    if (req.method === 'POST') {
      const user = await getUser(req, User)
      if (user.role !== 'superadmin' && user.role !== 'admin') throw new ApiError(403, 'Only admins/superadmins can create clubs')

      const { name, description, facultyCoordinatorId } = req.body
      if (!name) throw new ApiError(400, 'Club name is required')

      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const club = await Club.create({
        name,
        slug,
        description,
        facultyCoordinator: facultyCoordinatorId || null,
      })

      // If facultyCoordinator provided, update their user record
      if (facultyCoordinatorId) {
        await User.findByIdAndUpdate(facultyCoordinatorId, {
          role: 'faculty_coordinator',
          clubId: club._id,
        })
      }

      return res.status(201).json(new ApiResponse(201, club, 'Club created'))
    }

    return res.status(405).end()

  } catch (err) {
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, message: err.message })
  }
}
