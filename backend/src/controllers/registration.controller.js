import EventRegistration from '../models/EventRegistration.js'
import Event from '../models/Event.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import Joi from 'joi'

const registrationSchema = Joi.object({
  registrationNumber: Joi.string().trim().min(4).max(20).required(),
  name:               Joi.string().trim().min(2).max(100).required(),
  email:              Joi.string().email().max(254).required(),
  course:             Joi.string().trim().min(2).max(100).required(),
  section:            Joi.string().trim().min(1).max(20).required(),
  school:             Joi.string().trim().max(100).optional(),
  phone:              Joi.string().trim().min(7).max(15).required(),
  whatsapp:           Joi.string().trim().min(7).max(15).required(),
})

// POST /events/:id/register  — public, no auth needed
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).select('status registrationOpen registrationNotRequired title')
    if (!event) throw new ApiError(404, 'Event not found')
    if (event.status !== 'approved') throw new ApiError(400, 'Registrations are not open for this event')
    if (event.registrationNotRequired) throw new ApiError(400, 'This event does not require registration')
    if (!event.registrationOpen) throw new ApiError(400, 'Registrations are currently closed for this event')

    const { error, value } = registrationSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) throw new ApiError(400, error.details.map(d => d.message).join('; '))

    const existing = await EventRegistration.findOne({
      event: req.params.id,
      registrationNumber: value.registrationNumber.toUpperCase(),
    })
    if (existing) throw new ApiError(409, 'You have already registered for this event.')

    const registration = await EventRegistration.create({
      event: req.params.id,
      ...value,
      registrationNumber: value.registrationNumber.toUpperCase(),
      school: value.school || 'School of Computer Applications',
    })

    res.status(201).json(new ApiResponse(201, { _id: registration._id }, 'Registered successfully!'))
  } catch (err) {
    next(err)
  }
}

// GET /events/:id/registrations  — admin/faculty only
export const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).select('createdBy assignedFaculty')
    if (!event) throw new ApiError(404, 'Event not found')

    const userId = req.user.id.toString()
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role)
    const isFaculty = req.user.role === 'faculty'
    const isCreator = event.createdBy?.toString() === userId
    const isAssigned = (event.assignedFaculty || []).some(f => f?.toString() === userId)

    if (!isAdmin && !(isFaculty && (isCreator || isAssigned))) {
      throw new ApiError(403, 'Not authorised to view registrations for this event')
    }

    const registrations = await EventRegistration.find({ event: req.params.id }).sort({ createdAt: -1 })

    res.status(200).json(new ApiResponse(200, registrations, 'Registrations fetched'))
  } catch (err) {
    next(err)
  }
}

// GET /events/:id/registrations/count  — public
export const getRegistrationCount = async (req, res, next) => {
  try {
    const count = await EventRegistration.countDocuments({ event: req.params.id })
    res.status(200).json(new ApiResponse(200, { count }, 'Count fetched'))
  } catch (err) {
    next(err)
  }
}

// PATCH /events/:id/registration-toggle  — admin/faculty
export const toggleRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) throw new ApiError(404, 'Event not found')

    const userId = req.user.id.toString()
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role)
    const isCreator = event.createdBy?.toString() === userId
    const isAssigned = (event.assignedFaculty || []).some(f => f?.toString() === userId)

    if (!isAdmin && !isCreator && !isAssigned) {
      throw new ApiError(403, 'Not authorised to toggle registration for this event')
    }

    const { open } = req.body  // boolean
    event.registrationOpen = Boolean(open)
    await event.save()

    res.status(200).json(new ApiResponse(200, { registrationOpen: event.registrationOpen }, 'Registration toggled'))
  } catch (err) {
    next(err)
  }
}
