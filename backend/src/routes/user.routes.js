import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as userController from '../controllers/user.controller.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// ── Self routes ──────────────────────────────────────────────────────────────
router.get('/me/stats', userController.getUserStats)
router.put('/me/profile', uploadLimiter, userController.upload.single('profilePhoto'), userController.updateProfile)

// ── Named collection routes (MUST be before /:id) ───────────────────────────
router.get('/students', authorize('faculty', 'admin', 'superadmin'), userController.getStudents)
router.get('/faculty', authorize('faculty', 'admin', 'superadmin'), userController.getFaculty)

// ── Admin-only collection routes ─────────────────────────────────────────────
router.get('/', authorize('admin', 'superadmin'), userController.getAllUsers)
router.post('/', authorize('admin', 'superadmin'), userController.createUser)

// ── Dynamic :id routes (MUST be after all named routes) ──────────────────────
router.get('/:id', authorize('admin', 'superadmin'), userController.getUserById)
router.put('/:id', authorize('admin', 'superadmin'), userController.updateUser)
router.delete('/:id', authorize('admin', 'superadmin'), userController.deleteUser)

export default router
