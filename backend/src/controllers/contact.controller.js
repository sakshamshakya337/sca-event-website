import ContactQuery from '../models/ContactQuery.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

// Submit contact query (public)
export const submitQuery = async (req, res, next) => {
  try {
    const { name, email, subject, message, category, role, universityId } = req.body

    const query = await ContactQuery.create({
      name,
      email,
      subject,
      message,
      category,
      role,
      universityId
    })

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
