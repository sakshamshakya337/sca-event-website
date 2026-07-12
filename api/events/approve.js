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
        event.status = 'pending_dean'
        
        // 1. Notify Faculty (Creator) via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          if (creatorEmail) {
            await sendApprovalStageEmail({
              to: creatorEmail,
              recipientName: event.createdBy.firstName,
              eventTitle: event.title,
              eventDate: event.startDate || event.date,
              submittedBy: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
              stage: 'Dean',
              approvalLink: `${process.env.FRONTEND_URL}/events`,
              approvedByStage: 'Administrator (Approved & Forwarded to Dean)',
            })
          }
        } catch (emailErr) {
          console.error('Creator notification email failed:', emailErr)
        }

        // 2. Notify Faculty (Creator) via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Approved by Admin',
          message: `Your event "${event.title}" has been approved by the Administrator and forwarded to the Dean for review.`,
          type: 'success'
        })

        // 3. Notify Dean via email
        const dean = await User.findOne({ role: 'dean', isActive: true })
          .select('firstName personalEmail officialEmail')
        if (dean) {
          try {
            const deanEmail = dean.personalEmail || dean.officialEmail
            await sendApprovalStageEmail({
              to: deanEmail,
              recipientName: dean.firstName,
              eventTitle: event.title,
              eventDate: event.startDate || event.date,
              submittedBy: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
              stage: 'Dean',
              approvalLink: `${process.env.FRONTEND_URL}/dean`,
              approvedByStage: 'Administrator',
            })
          } catch (emailErr) {
            console.error('Dean email notification failed:', emailErr)
          }

          // 4. Notify Dean via in-app notification
          await createNotification({
            recipient: dean._id,
            sender: approver._id,
            title: 'New Event Awaiting Approval',
            message: `Event "${event.title}" is pending your approval.`,
            type: 'info'
          })
        }
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

    // ── DEAN stage ───────────────────────────────────────────────────────────
    else if (role === 'dean') {
      if (event.status !== 'pending_dean') {
        throw new ApiError(400, `Event is not pending Dean approval. Current: ${event.status}`)
      }

      event.deanApproval = {
        status:     action === 'approve' ? 'approved' : 'rejected',
        approvedBy: approver._id,
        approvedAt: new Date(),
        remarks,
      }
      event.approvalChain.push({
        stage:        'dean',
        action:       action === 'approve' ? 'approved' : 'rejected',
        actionBy:     approver._id,
        actionByName: `${approver.firstName} ${approver.lastName}`,
        actionByRole: 'dean',
        remarks,
      })

      if (action === 'approve') {
        event.status = 'pending_hos'

        // 1. Notify Faculty (Creator) via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          if (creatorEmail) {
            await sendApprovalStageEmail({
              to: creatorEmail,
              recipientName: event.createdBy.firstName,
              eventTitle: event.title,
              eventDate: event.startDate || event.date,
              submittedBy: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
              stage: 'Head of School',
              approvalLink: `${process.env.FRONTEND_URL}/events`,
              approvedByStage: 'Dean (Approved & Forwarded to HOS)',
            })
          }
        } catch (emailErr) {
          console.error('Creator notification email failed:', emailErr)
        }

        // 2. Notify Faculty (Creator) via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Approved by Dean',
          message: `Your event "${event.title}" has been approved by the Dean and forwarded to the Head of School for final review.`,
          type: 'success'
        })

        // 3. Notify HOS via email
        const hos = await User.findOne({ role: 'hos', isActive: true })
          .select('firstName personalEmail officialEmail')
        if (hos) {
          try {
            const hosEmail = hos.personalEmail || hos.officialEmail
            await sendApprovalStageEmail({
              to: hosEmail,
              recipientName: hos.firstName,
              eventTitle: event.title,
              eventDate: event.startDate || event.date,
              submittedBy: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
              stage: 'Head of School',
              approvalLink: `${process.env.FRONTEND_URL}/hos`,
              approvedByStage: 'School Dean',
            })
          } catch (emailErr) {
            console.error('HOS email notification failed:', emailErr)
          }

          // 4. Notify HOS via in-app notification
          await createNotification({
            recipient: hos._id,
            sender: approver._id,
            title: 'New Event Awaiting Final Approval',
            message: `Event "${event.title}" is pending your final approval.`,
            type: 'info'
          })
        }
      } else {
        event.status = 'rejected'
        // Notify faculty of rejection via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          await sendRejectionStageEmail({
            to: creatorEmail,
            recipientName: event.createdBy.firstName,
            eventTitle: event.title,
            rejectedBy: 'School Dean',
            remarks,
          })
        } catch (emailErr) {
          console.error('Rejection email notification failed:', emailErr)
        }

        // Notify faculty of rejection via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Rejected by Dean',
          message: `Your event "${event.title}" has been rejected by the Dean. Remarks: ${remarks}`,
          type: 'error'
        })
      }
    }

    // ── HOS stage ────────────────────────────────────────────────────────────
    else if (role === 'hos') {
      if (event.status !== 'pending_hos') {
        throw new ApiError(400, `Event is not pending HOS approval. Current: ${event.status}`)
      }

      event.hosApproval = {
        status:     action === 'approve' ? 'approved' : 'rejected',
        approvedBy: approver._id,
        approvedAt: new Date(),
        remarks,
      }
      event.approvalChain.push({
        stage:        'hos',
        action:       action === 'approve' ? 'approved' : 'rejected',
        actionBy:     approver._id,
        actionByName: `${approver.firstName} ${approver.lastName}`,
        actionByRole: 'hos',
        remarks,
      })

      if (action === 'approve') {
        // ── FINAL APPROVAL — event goes LIVE ──────────────────────────────
        event.status = 'approved'
        event.isPublic = true
        event.registrationEnabled = true
        event.registrationOpen = true // Open registration
        
        // Notify faculty/coordinator via email
        try {
          const creatorEmail = event.createdBy.personalEmail || event.createdBy.officialEmail
          await sendFinalApprovalEmail({
            to: creatorEmail,
            recipientName: event.createdBy.firstName,
            eventTitle: event.title,
            eventDate: event.startDate || event.date,
            publicUrl: `${process.env.FRONTEND_URL}/events`,
          })
        } catch (emailErr) {
          console.error('Final approval email failed:', emailErr)
        }

        // Notify faculty/coordinator via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Fully Approved & LIVE!',
          message: `Congratulations! Your event "${event.title}" has been fully approved by the Head of School and is now LIVE.`,
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
            rejectedBy: 'Head of School',
            remarks,
          })
        } catch (emailErr) {
          console.error('Rejection email failed:', emailErr)
        }

        // Notify faculty of rejection via in-app notification
        await createNotification({
          recipient: event.createdBy._id,
          sender: approver._id,
          title: 'Event Rejected by Head of School',
          message: `Your event "${event.title}" has been rejected by the Head of School. Remarks: ${remarks}`,
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
