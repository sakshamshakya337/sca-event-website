// api/events/pending.js
import { connectDB } from '../../lib/db.js'
import { getUser } from '../../lib/auth.js'
import Event from '../../models/Event.js'
import User from '../../models/User.js'
import ApiResponse from '../../utils/ApiResponse.js'
import ApiError from '../../utils/ApiError.js'

const CORS = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Map role → which status they see
const ROLE_STATUS_MAP = {
  admin:      ['pending_admin', 'pending'],
  superadmin: ['pending_admin', 'pending'],
  dean:       'pending_dean',
  hos:        'pending_hos',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    await connectDB()
    const user = await getUser(req, User)

    const pendingStatus = ROLE_STATUS_MAP[user.role]
    if (!pendingStatus) throw new ApiError(403, 'You do not have approval permissions')

    const dbQuery = Array.isArray(pendingStatus)
      ? { status: { $in: pendingStatus } }
      : { status: pendingStatus }

    const events = await Event.find(dbQuery)
      .populate('createdBy', 'firstName lastName role designation')
      .populate('clubId', 'name slug')
      .sort({ createdAt: -1 })
      .lean()

    // Map standard fields like startDate to date so frontend receives it
    const formattedEvents = events.map(e => ({
      ...e,
      date: e.startDate || e.date
    }))

    return res.status(200).json(new ApiResponse(200, formattedEvents, 'Pending events fetched'))

  } catch (err) {
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, message: err.message })
  }
}
