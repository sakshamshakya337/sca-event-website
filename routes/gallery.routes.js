import express from 'express'
import {
  createGallery,
  getGalleries,
  getGalleryById,
  updateGallery,
  deleteGallery,
  uploadGalleryFields,
  approveGallery,
  rejectGallery
} from '../controllers/gallery.controller.js'
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(optionalAuth, getGalleries)
  .post(protect, authorize('faculty', 'admin', 'superadmin'), uploadGalleryFields, createGallery)

router.route('/:id')
  .get(getGalleryById)
  .put(protect, authorize('faculty', 'admin', 'superadmin'), uploadGalleryFields, updateGallery)
  .delete(protect, authorize('faculty', 'admin', 'superadmin'), deleteGallery)

// Approval actions
router.put('/:id/approve', protect, authorize('hod', 'hos', 'superadmin'), approveGallery)
router.put('/:id/reject', protect, authorize('hod', 'hos', 'superadmin'), rejectGallery)

export default router
