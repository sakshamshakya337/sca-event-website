import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import ContactQuery from '../../lib/models/ContactQuery.js';
import { ApiError, ApiResponse } from '../../lib/response.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'POST') {
      const { name, email, subject, message, category, role, universityId } = req.body;
      if (!name || !email || !subject || !message) {
        throw new ApiError(400, 'Name, email, subject, and message are required.');
      }
      const query = await ContactQuery.create({
        name, email, subject, message, category, role, universityId
      });
      return res.status(201).json(new ApiResponse(201, query, 'Query submitted successfully'));
    }

    // All other methods require authentication
    const user = await protect(req);

    const { id, type, status } = req.query;

    if (req.method === 'GET') {
      if (type === 'stats') {
        const totalQueries = await ContactQuery.countDocuments();
        const pendingQueries = await ContactQuery.countDocuments({ status: 'pending' });
        const inProgressQueries = await ContactQuery.countDocuments({ status: 'in_progress' });
        const resolvedQueries = await ContactQuery.countDocuments({ status: 'resolved' });
        return res.status(200).json(new ApiResponse(200, { totalQueries, pendingQueries, inProgressQueries, resolvedQueries }, 'Stats fetched successfully'));
      }

      // Admin only methods
      authorize(user, 'admin', 'superadmin');

      if (id) {
        const query = await ContactQuery.findById(id)
          .populate('assignedTo', 'firstName lastName')
          .populate('resolvedBy', 'firstName lastName');
        if (!query) throw new ApiError(404, 'Query not found');
        return res.status(200).json(new ApiResponse(200, query, 'Query fetched successfully'));
      } else {
        const filter = {};
        if (status) filter.status = status;
        const queries = await ContactQuery.find(filter)
          .populate('assignedTo', 'firstName lastName')
          .populate('resolvedBy', 'firstName lastName')
          .sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, queries, 'Queries fetched successfully'));
      }

    } else if (req.method === 'PUT') {
      authorize(user, 'admin', 'superadmin');
      if (!id) throw new ApiError(400, 'Query ID is required');

      const query = await ContactQuery.findById(id);
      if (!query) throw new ApiError(404, 'Query not found');

      const { status: bodyStatus, response, assignedTo } = req.body;
      if (bodyStatus) query.status = bodyStatus;
      if (response) query.response = response;
      if (assignedTo) query.assignedTo = assignedTo;

      if (bodyStatus === 'resolved') {
        query.resolvedBy = user._id;
        query.resolvedAt = new Date();
      }

      await query.save();
      await query.populate('assignedTo resolvedBy', 'firstName lastName');
      return res.status(200).json(new ApiResponse(200, query, 'Query updated successfully'));

    } else if (req.method === 'DELETE') {
      authorize(user, 'admin', 'superadmin');
      if (!id) throw new ApiError(400, 'Query ID is required');

      const query = await ContactQuery.findById(id);
      if (!query) throw new ApiError(404, 'Query not found');

      await ContactQuery.findByIdAndDelete(id);
      return res.status(200).json(new ApiResponse(200, null, 'Query deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
