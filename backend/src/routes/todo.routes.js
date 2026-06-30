import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as todoController from '../controllers/todo.controller.js'

const router = express.Router()

router.use(protect)

router.get('/event/:eventId', todoController.getEventTodos)
router.post('/', authorize('faculty', 'admin', 'superadmin'), todoController.createTodo)
router.put('/:id', todoController.updateTodo)
router.put('/:id/complete', todoController.completeTodo)
router.delete('/:id', todoController.deleteTodo)

export default router
