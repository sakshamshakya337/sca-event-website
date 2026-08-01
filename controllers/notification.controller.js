import Notification from '../models/Notification.js'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import { sendMail } from '../utils/mailer.js'

// Fetch all notifications for logged in user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
    res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Mark single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    )
    if (!notification) {
      throw new ApiError(404, 'Notification not found')
    }
    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'))
  } catch (error) {
    next(error)
  }
}

// Mark all user's notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    )
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'))
  } catch (error) {
    next(error)
  }
}

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    })
    if (!notification) {
      throw new ApiError(404, 'Notification not found')
    }
    res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'))
  } catch (error) {
    next(error)
  }
}

// Send notification to users by Registration Number / Employee ID (Admin/Superadmin only)
export const sendAdminNotification = async (req, res, next) => {
  try {
    const { targetIds, title, message, type } = req.body

    if (!title || !message) {
      throw new ApiError(400, 'Title and message are required')
    }

    if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
      throw new ApiError(400, 'At least one target Registration Number or Employee ID is required')
    }

    const cleanedIds = targetIds.map(id => id.trim().toUpperCase()).filter(Boolean)

    // Find users
    const users = await User.find({
      $or: [
        { registrationNumber: { $in: cleanedIds } },
        { employeeId: { $in: cleanedIds } }
      ]
    })

    if (users.length === 0) {
      throw new ApiError(404, 'No matching users found for the provided IDs')
    }

    const foundRegNumbers = users.map(u => u.registrationNumber).filter(Boolean)
    const foundEmpIds = users.map(u => u.employeeId).filter(Boolean)
    const foundAllIds = [...foundRegNumbers, ...foundEmpIds]

    const missingIds = cleanedIds.filter(id => !foundAllIds.includes(id))

    // Batch create notifications
    const notificationsToCreate = users.map(user => ({
      recipient: user._id,
      sender: req.user.id,
      title,
      message,
      type: type || 'info'
    }))

    await Notification.insertMany(notificationsToCreate)

    // Dispatch Gmail SMTP email notifications asynchronously
    users.forEach((user) => {
      const email = user.officialEmail || user.personalEmail
      if (!email) return

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 20px;">SCA Portal Announcement</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <h3 style="color: #2563eb; font-size: 18px; margin-top: 20px;">${title}</h3>
            <p style="font-size: 15px; color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0;">© ${new Date().getFullYear()} School of Computer Applications, LPU. All rights reserved.</p>
          </div>
        </div>
      `

      sendMail({
        to: email,
        subject: `📢 ${title} — SCA Portal`,
        html,
      }).catch((err) => {
        console.error(`❌ Async broadcast email failed for ${email}:`, err.message)
      })
    })

    res.status(201).json(new ApiResponse(201, {
      successCount: users.length,
      missingIds
    }, `Notification sent in-app & via email to ${users.length} user(s).`))
  } catch (error) {
    next(error)
  }
}

