import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import Todo from '../../lib/models/Todo.js';
import Event from '../../lib/models/Event.js';
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
    const user = await protect(req);

    // Get dynamic ID / Event ID if any from query
    const { id, eventId, action } = req.query;

    if (req.method === 'GET') {
      if (!eventId) {
        throw new ApiError(400, 'eventId query parameter is required');
      }
      const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
      const event = isObjectId 
        ? await Event.findById(eventId)
        : await Event.findOne({ slug: eventId });
        
      if (!event) throw new ApiError(404, 'Event not found');

      const userId = user._id.toString();
      const isAdmin = ['admin', 'superadmin'].includes(user.role);
      const isCreator = event.createdBy ? event.createdBy.toString() === userId : false;
      const isAssignedFaculty = (event.assignedFaculty || []).some(f => f && f.toString() === userId);
      const isAssignedStudent = (event.assignedStudents || []).some(s => s && s.toString() === userId);

      let todos;
      if (isAdmin || isCreator || isAssignedFaculty || isAssignedStudent) {
        todos = await Todo.find({ event: event._id })
          .populate('createdBy', 'firstName lastName registrationNumber officialEmail')
          .populate('completedBy', 'firstName lastName registrationNumber officialEmail')
          .sort({ createdAt: -1 });
      } else {
        todos = await Todo.find({
          event: event._id,
          audience: { $in: ['all', 'students'] }
        })
          .populate('createdBy', 'firstName lastName registrationNumber officialEmail')
          .populate('completedBy', 'firstName lastName registrationNumber officialEmail')
          .sort({ createdAt: -1 });
      }
      return res.status(200).json(new ApiResponse(200, todos, 'Todos fetched successfully'));

    } else if (req.method === 'POST') {
      authorize(user, 'faculty', 'admin', 'superadmin');
      const { event: bodyEventId, title, audience, isImportant } = req.body;
      const todo = await Todo.create({
        event: bodyEventId,
        title,
        audience,
        isImportant,
        createdBy: user._id
      });
      await todo.populate('createdBy', 'firstName lastName');
      return res.status(201).json(new ApiResponse(201, todo, 'Todo created successfully'));

    } else if (req.method === 'PUT') {
      if (!id) throw new ApiError(400, 'Todo ID is required');
      const todo = await Todo.findById(id);
      if (!todo) throw new ApiError(404, 'Todo not found');

      if (action === 'complete') {
        if (!todo.completedBy.includes(user._id)) {
          todo.completedBy.push(user._id);
        }
        await todo.save();
        await todo.populate('createdBy', 'firstName lastName registrationNumber officialEmail');
        await todo.populate('completedBy', 'firstName lastName registrationNumber officialEmail');
        return res.status(200).json(new ApiResponse(200, todo, 'Todo marked as completed'));
      } else {
        const { title, audience, isImportant } = req.body;
        if (title) todo.title = title;
        if (audience) todo.audience = audience;
        if (typeof isImportant === 'boolean') todo.isImportant = isImportant;
        await todo.save();
        await todo.populate('createdBy', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, todo, 'Todo updated successfully'));
      }

    } else if (req.method === 'DELETE') {
      if (!id) throw new ApiError(400, 'Todo ID is required');
      const todo = await Todo.findById(id);
      if (!todo) throw new ApiError(404, 'Todo not found');
      await Todo.findByIdAndDelete(id);
      return res.status(200).json(new ApiResponse(200, null, 'Todo deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
