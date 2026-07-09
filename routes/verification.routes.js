import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as verificationController from '../controllers/verification.controller.js'

const router = express.Router()

// Protected routes
router.use(protect)

// User routes
router.post('/', verificationController.upload.fields([
  { name: 'universityId', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), verificationController.submitApplication)
router.get('/my', verificationController.getMyApplication)

// Admin routes
router.use(authorize('admin', 'superadmin'))

router.get('/', verificationController.getAllApplications)
router.get('/:id', verificationController.getApplicationById)
router.put('/:id/approve', verificationController.approveApplication)
router.put('/:id/reject', verificationController.rejectApplication)

export default router
