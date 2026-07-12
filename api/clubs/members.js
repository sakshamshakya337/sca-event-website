// api/clubs/members.js
import { connectDB } from '../../lib/db.js'
import { getUser } from '../../lib/auth.js'
import Club from '../../models/Club.js'
import User from '../../models/User.js'
import ApiResponse from '../../utils/ApiResponse.js'
import ApiError from '../../utils/ApiError.js'

const CORS = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await connectDB()
    const admin = await getUser(req, User)
    if (!['admin', 'superadmin'].includes(admin.role)) {
      throw new ApiError(403, 'Insufficient permissions')
    }

    const { clubId, action, userId } = req.body
    // action: 'set_president' | 'set_vice_president' | 'add_member' | 'remove_member'

    const club = await Club.findById(clubId)
    if (!club) throw new ApiError(404, 'Club not found')

    const targetUser = await User.findById(userId)
    if (!targetUser) throw new ApiError(404, 'User not found')

    if (action === 'set_president') {
      // Remove old president role if exists
      if (club.president) {
        await User.findByIdAndUpdate(club.president, { role: 'student', clubId: null })
      }
      club.president = userId
      await User.findByIdAndUpdate(userId, { role: 'club_president', clubId: club._id })
    }
    else if (action === 'set_vice_president') {
      if (club.vicePresident) {
        await User.findByIdAndUpdate(club.vicePresident, { role: 'student', clubId: null })
      }
      club.vicePresident = userId
      await User.findByIdAndUpdate(userId, { role: 'club_vice_president', clubId: club._id })
    }
    else if (action === 'add_member') {
      if (!club.members.includes(userId)) {
        club.members.push(userId)
        await User.findByIdAndUpdate(userId, { clubId: club._id })
      }
    }
    else if (action === 'remove_member') {
      club.members = club.members.filter(m => m.toString() !== userId)
      await User.findByIdAndUpdate(userId, { clubId: null })
    }
    else {
      throw new ApiError(400, 'Invalid action')
    }

    await club.save()
    return res.status(200).json(new ApiResponse(200, club, 'Club updated'))

  } catch (err) {
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, message: err.message })
  }
}
