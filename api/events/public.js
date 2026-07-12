// api/events/public.js
import { connectDB } from '../../lib/db.js'
import Event from '../../models/Event.js'
import ApiResponse from '../../utils/ApiResponse.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await connectDB()

    const events = await Event.find({
      status: 'approved',
      isPublic: true,
      startDate: { $gte: new Date() },   // only upcoming events
    })
    .populate('createdBy', 'firstName lastName designation')
    .populate('clubId', 'name slug logoUrl')
    .select('title description startDate endDate time venue eventType clubId createdBy imageUrl registrationEnabled registrationFee registrationDeadline maxParticipants approvalChain')
    .sort({ startDate: 1 })
    .lean()

    const formattedEvents = events.map(e => ({
      ...e,
      date: e.startDate || e.date
    }))

    return res.status(200).json(new ApiResponse(200, formattedEvents, 'Public events fetched'))

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
