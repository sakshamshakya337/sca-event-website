import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as departmentController from '../controllers/department.controller.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Publicly available to authenticated users (e.g. for dropdowns)
router.get('/', departmentController.getDepartments)

// Super Admin only routes
router.use(authorize('superadmin', 'admin'))

router.post('/', departmentController.createDepartment)
router.put('/:id', departmentController.updateDepartment)
router.delete('/:id', departmentController.deleteDepartment)
router.put('/:id/assign-hods', departmentController.assignHod)

export default router
