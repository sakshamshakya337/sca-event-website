import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as eventController from '../controllers/event.controller.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Public approved events
router.get('/approved', eventController.getApprovedEvents)
router.get('/approved-events', eventController.getApprovedEvents)

// Protected routes
router.use(protect)

router.get('/stats', eventController.getEventStats)
router.get('/my', authorize('faculty'), eventController.getMyEvents)
router.post('/', authorize('faculty', 'admin', 'superadmin'), uploadLimiter, eventController.upload.single('image'), eventController.createEvent)

// Admin routes for approval and assignment
router.put('/:id/approve', authorize('admin', 'superadmin'), eventController.approveEvent)
router.put('/:id/reject', authorize('admin', 'superadmin'), eventController.rejectEvent)
router.put('/:id/assign-faculty', authorize('admin', 'superadmin'), eventController.assignFaculty)
router.put('/:id/assign-students', authorize('admin', 'superadmin', 'faculty'), eventController.assignStudents)

router.get('/:id', eventController.getEventById)
router.put('/:id', uploadLimiter, eventController.upload.single('image'), eventController.updateEvent)
router.put('/:id/complete', eventController.completeEvent)
router.delete('/:id', eventController.deleteEvent)

// Get all events
router.get('/', eventController.getAllEvents)

export default router
