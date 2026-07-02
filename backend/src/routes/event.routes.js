import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as eventController from '../controllers/event.controller.js'
import * as regController from '../controllers/registration.controller.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'
import { handleEventUpload } from '../config/multer.js'
import Event from '../models/Event.js'

// Wraps handleEventUpload so multer errors return 400 JSON instead of 500
const safeUpload = (req, res, next) => {
  handleEventUpload(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_UNEXPECTED_FILE'
        ? `Unexpected file field "${err.field}". Allowed: image, gallery.`
        : err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Max 5 MB per image.'
        : err.message || 'File upload failed.'
      return res.status(400).json({ success: false, message: msg })
    }
    next()
  })
}

const router = express.Router()

// Temporary route to update all events (remove after use)
router.get('/temp-update-all', async (req, res) => {
  try {
    const result = await Event.updateMany(
      { externalImageUrls: { $exists: false } },
      { $set: { externalImageUrls: [] } }
    )
    const result2 = await Event.updateMany(
      { externalImageUrls: { $not: { $type: 'array' } } },
      { $set: { externalImageUrls: [] } }
    )
    res.json({
      success: true,
      message: 'Events updated',
      data: {
        updatedExisting: result.modifiedCount,
        fixedInvalid: result2.modifiedCount
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no authentication required
// ─────────────────────────────────────────────────────────────────────────────
router.get('/approved',        eventController.getApprovedEvents)
router.get('/approved-events', eventController.getApprovedEvents)
router.get('/detail/:id',                      eventController.getPublicEventById)
router.get('/detail/:id/registrations/count',  regController.getRegistrationCount)
router.post('/detail/:id/register',            regController.registerForEvent)

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES — require valid JWT
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect)

router.get('/stats', eventController.getEventStats)
router.get('/my',    authorize('faculty'), eventController.getMyEvents)

// Create event
router.post(
  '/',
  authorize('faculty', 'admin', 'superadmin'),
  uploadLimiter,
  safeUpload,
  eventController.createEvent
)

// Admin approval actions
router.put('/:id/approve',         authorize('admin', 'superadmin'), eventController.approveEvent)
router.put('/:id/reject',          authorize('admin', 'superadmin'), eventController.rejectEvent)
router.put('/:id/assign-faculty',  authorize('admin', 'superadmin'), eventController.assignFaculty)
router.put('/:id/assign-students', authorize('admin', 'superadmin', 'faculty'), eventController.assignStudents)

// Registration toggle
router.patch('/:id/registration-toggle', regController.toggleRegistration)

// View registrations
router.get('/:id/registrations', regController.getEventRegistrations)

// Single event CRUD
router.get('/:id',          eventController.getEventById)
router.put('/:id',          uploadLimiter, safeUpload, eventController.updateEvent)
router.put('/:id/complete', eventController.completeEvent)
router.delete('/:id',       eventController.deleteEvent)

// All events (role-filtered inside controller)
router.get('/', eventController.getAllEvents)

export default router
