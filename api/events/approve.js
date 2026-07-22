// api/events/approve.js
import { connectDB } from '../../lib/db.js'
import { getUser } from '../../lib/auth.js'
import Event from '../../models/Event.js'
import User from '../../models/User.js'
import Notification from '../../models/Notification.js'
import { sendApprovalStageEmail, sendFinalApprovalEmail, sendRejectionStageEmail } from '../../lib/emailService.js'
import ApiResponse from '../../utils/ApiResponse.js'
import ApiError from '../../utils/ApiError.js'

async function createNotification({ recipient, sender, title, message, type = 'info' }) {
  try {
    await Notification.create({ recipient, sender, title, message, type })
  } catch (err) {
    console.error('Failed to create in-app notification:', err)
  }
}

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
    const approver = await getUser(req, User)
    const { eventId, action, remarks = '' } = req.body
    // action = 'approve' | 'reject'

    if (!eventId || !action) throw new ApiError(400, 'eventId and action are required')
    if (!['approve', 'reject'].includes(action)) throw new ApiError(400, 'Invalid action')

    const event = await Event.findById(eventId)
      .populate('createdBy', 'firstName lastName personalEmail officialEmail')
    if (!event) throw new ApiError(404, 'Event not found')

    const role = approver.role

    // ── ADMIN stage ──────────────────────────────────────────────────────────
    if (role === 'admin' || role === 'superadmin') {
      if (event.status !== 'pending_admin' && event.status !== 'pending') {
        throw new ApiError(400, `Event is not pending admin approval. Current: ${event.status}`)
      }

      event.adminApproval = {
        status:     action === 'approve' ? 'approved' : 'rejected',
        approvedBy: approver._id,
        approvedAt: new Date(),
        remarks,
      }
      event.approvalChain.push({
        stage:        'admin',
        action:       action === 'approve' ? 'approved' : 'rejected',
        actionBy:     approver._id,
        actionByName: `${approver.firstName} ${approver.lastName}`,
        actionByRole: approver.role,
        remarks,
      })

      if (action === 'approve') {
        event.status = 'published'
        event.isPublished = true
        event.registrationEnabled = true
        event.registrationOpen = true // Optional, depending on event logic but safe to set
        
        // 1. Notify Faculty (Creator) via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          if (creatorEmail) {
            await sendFinalApprovalEmail({
              to: creatorEmail,
              recipientName: event.createdBy.firstName,
              eventTitle: event.title,
              eventDate: event.startDate || event.date,
              publicUrl: `${process.env.FRONTEND_URL}/events`,
            })
          }
        } catch (emailErr) {
          console.error('Creator notification email failed:', emailErr)
        }

        // 2. Notify Faculty (Creator) via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Fully Approved & LIVE!',
          message: `Congratulations! Your event "${event.title}" has been fully approved by the Administrator and is now LIVE.`,
          type: 'success'
        })
      } else {
        event.status = 'rejected'
        // Notify faculty of rejection via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          await sendRejectionStageEmail({
            to: creatorEmail,
            recipientName: event.createdBy.firstName,
            eventTitle: event.title,
            rejectedBy: 'Administration',
            remarks,
          })
        } catch (emailErr) {
          console.error('Rejection email notification failed:', emailErr)
        }

        // Notify faculty of rejection via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Rejected by Admin',
          message: `Your event "${event.title}" has been rejected by the Administrator. Remarks: ${remarks}`,
          type: 'error'
        })
      }
    }
    else {
      throw new ApiError(403, `Role '${role}' cannot approve events`)
    }

    await event.save()

    return res.status(200).json(
      new ApiResponse(200, { status: event.status }, `Event ${action}d successfully`)
    )

  } catch (err) {
    const status = err.statusCode || 500
    return res.status(status).json({ success: false, message: err.message })
  }
}
