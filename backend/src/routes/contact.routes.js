import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as contactController from '../controllers/contact.controller.js'

const router = express.Router()

// Public route
router.post('/', contactController.submitQuery)

// Protected routes
router.use(protect)

router.get('/stats', contactController.getQueryStats)

// Admin routes
router.use(authorize('admin', 'superadmin'))

router.get('/', contactController.getAllQueries)
router.get('/:id', contactController.getQueryById)
router.put('/:id', contactController.updateQueryStatus)
router.delete('/:id', contactController.deleteQuery)

export default router
