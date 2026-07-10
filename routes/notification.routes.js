import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as notificationController from '../controllers/notification.controller.js'

const router = express.Router()

// All routes require user authentication
router.use(protect)

router.get('/', notificationController.getNotifications)
router.put('/read-all', notificationController.markAllAsRead)
router.put('/:id/read', notificationController.markAsRead)
router.delete('/:id', notificationController.deleteNotification)

// Admin/Superadmin only route to send targeted notifications
router.post('/send-admin', authorize('admin', 'superadmin'), notificationController.sendAdminNotification)

export default router
