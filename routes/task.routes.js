import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import * as taskController from '../controllers/task.controller.js'

const router = express.Router()

router.use(protect)

router.get('/my', taskController.getMyTasks)
router.get('/event/:eventId', taskController.getEventTasks)
router.post('/', taskController.createTask)
router.put('/:id', taskController.updateTask)
router.put('/:id/complete', taskController.completeTask)
router.delete('/:id', taskController.deleteTask)

export default router
