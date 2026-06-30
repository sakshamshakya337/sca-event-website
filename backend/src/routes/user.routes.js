import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as userController from '../controllers/user.controller.js'

const router = express.Router()



// Protected routes
router.use(protect)

router.get('/me/stats', userController.getUserStats)
router.put('/me/profile', userController.upload.single('profilePhoto'), userController.updateProfile)

// Student list for faculty/admin
router.get('/students', authorize('faculty', 'admin', 'superadmin'), userController.getStudents)

// Admin routes
router.use(authorize('admin', 'superadmin'))

router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

export default router
