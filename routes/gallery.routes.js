import express from 'express'
import {
  createGallery,
  getGalleries,
  getGalleryById,
  updateGallery,
  deleteGallery,
  uploadGalleryFields
} from '../controllers/gallery.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(getGalleries)
  .post(protect, authorize('admin', 'superadmin'), uploadGalleryFields, createGallery)

router.route('/:id')
  .get(getGalleryById)
  .put(protect, authorize('admin', 'superadmin'), uploadGalleryFields, updateGallery)
  .delete(protect, authorize('admin', 'superadmin'), deleteGallery)

export default router
