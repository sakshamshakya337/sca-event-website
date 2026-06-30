import express from 'express'
import { login, getCurrentUser, logout, changePassword, signup } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', protect, getCurrentUser)
router.post('/change-password', protect, changePassword)
router.post('/logout', logout)

export default router
