import ContactQuery from '../models/ContactQuery.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import Joi from 'joi'
import { sendMail } from '../utils/mailer.js'
import { contactQueryReplyTemplate } from '../utils/emailTemplates.js'

const contactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().max(254).required(),
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(10).max(2000).required(),
  category: Joi.string().valid('Event Query', 'Technical Issue', 'Registration Dispute', 'Feedback', 'Other').optional(),
  role: Joi.string().valid('student', 'faculty', 'admin', 'other').optional(),
  universityId: Joi.string().trim().max(30).optional().allow(''),
})

// Submit contact query (public)
export const submitQuery = async (req, res, next) => {
  try {
    const { error, value } = contactSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map(d => d.message).join('; ')
      throw new ApiError(400, messages)
    }

    const query = await ContactQuery.create(value)
    res.status(201).json(new ApiResponse(201, query, 'Query submitted successfully'))
  } catch (error) {
    next(error)
  }
}

// Get all queries (admin only)
export const getAllQueries = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status) filter.status = status

    const queries = await ContactQuery.find(filter)
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.status(200).json(new ApiResponse(200, queries, 'Queries fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Get single query
export const getQueryById = async (req, res, next) => {
  try {
    const query = await ContactQuery.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')

    if (!query) {
      throw new ApiError(404, 'Query not found')
    }

    res.status(200).json(new ApiResponse(200, query, 'Query fetched successfully'))
  } catch (error) {
    next(error)
  }
}

// Update query status (admin only)
export const updateQueryStatus = async (req, res, next) => {
  try {
    const query = await ContactQuery.findById(req.params.id)
    if (!query) {
      throw new ApiError(404, 'Query not found')
    }

    const { status, response, assignedTo } = req.body

    if (status) query.status = status
    if (response) query.response = response
    if (assignedTo) query.assignedTo = assignedTo

    if (status === 'resolved') {
      query.resolvedBy = req.user.id
      query.resolvedAt = new Date()
    }

    await query.save()
    await query.populate('assignedTo resolvedBy', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, query, 'Query updated successfully'))
  } catch (error) {
    next(error)
  }
}

// Delete query (admin only)
export const deleteQuery = async (req, res, next) => {
  try {
    const query = await ContactQuery.findById(req.params.id)
    if (!query) {
      throw new ApiError(404, 'Query not found')
    }

    await ContactQuery.findByIdAndDelete(req.params.id)

    res.status(200).json(new ApiResponse(200, null, 'Query deleted successfully'))
  } catch (error) {
    next(error)
  }
}

// Reply to contact query via email (admin only)
export const replyToQuery = async (req, res, next) => {
  try {
    const { replyMessage } = req.body
    if (!replyMessage || typeof replyMessage !== 'string' || replyMessage.trim().length < 5) {
      throw new ApiError(400, 'Reply message is required and must be at least 5 characters long')
    }

    const query = await ContactQuery.findById(req.params.id)
    if (!query) {
      throw new ApiError(404, 'Query not found')
    }

    // Send email to query.email
    const emailResult = await sendMail({
      to: query.email,
      subject: `Re: ${query.subject}`,
      html: contactQueryReplyTemplate({
        name: query.name,
        querySubject: query.subject,
        queryMessage: query.message,
        replyMessage: replyMessage.trim(),
      }),
    })

    if (!emailResult.success) {
      throw new ApiError(500, `Failed to send email: ${emailResult.error}`)
    }

    // Update query in DB
    query.status = 'resolved'
    query.response = replyMessage.trim()
    query.resolvedBy = req.user.id
    query.resolvedAt = new Date()

    await query.save()
    await query.populate('assignedTo resolvedBy', 'firstName lastName')

    res.status(200).json(new ApiResponse(200, query, 'Reply sent and query resolved successfully'))
  } catch (error) {
    next(error)
  }
}

// Get query stats
export const getQueryStats = async (req, res, next) => {
  try {
    const totalQueries = await ContactQuery.countDocuments()
    const pendingQueries = await ContactQuery.countDocuments({ status: 'pending' })
    const inProgressQueries = await ContactQuery.countDocuments({ status: 'in_progress' })
    const resolvedQueries = await ContactQuery.countDocuments({ status: 'resolved' })

    res.status(200).json(new ApiResponse(200, { totalQueries, pendingQueries, inProgressQueries, resolvedQueries }, 'Stats fetched successfully'))
  } catch (error) {
    next(error)
  }
}
