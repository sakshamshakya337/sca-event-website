import { connectDB } from '../../lib/db.js';
import { protect } from '../../lib/auth.js';
import Task from '../../lib/models/Task.js';
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

    const { id, eventId, type, isDone, action } = req.query;

    if (req.method === 'GET') {
      if (type === 'my') {
        const filter = { assignedTo: user._id };
        if (isDone !== undefined) filter.isDone = isDone === 'true';

        const tasks = await Task.find(filter)
          .populate('event', 'title date')
          .populate('createdBy', 'firstName lastName')
          .populate('assignedTo', 'firstName lastName')
          .sort({ dueDate: 1 });
        return res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'));
      }

      if (!eventId) {
        throw new ApiError(400, 'eventId or type=my is required');
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

      let tasks;
      if (isAdmin || isCreator || isAssignedFaculty || isAssignedStudent) {
        tasks = await Task.find({ event: event._id })
          .populate('event', 'title date')
          .populate('createdBy', 'firstName lastName')
          .populate('assignedTo', 'firstName lastName')
          .sort({ dueDate: 1 });
      } else {
        tasks = await Task.find({
          event: event._id,
          assignedTo: user._id
        })
          .populate('event', 'title date')
          .populate('createdBy', 'firstName lastName')
          .populate('assignedTo', 'firstName lastName')
          .sort({ dueDate: 1 });
      }
      return res.status(200).json(new ApiResponse(200, tasks, 'Tasks fetched successfully'));

    } else if (req.method === 'POST') {
      const { title, event: bodyEventId, assignedTo, priority, dueDate, notes } = req.body;
      const task = await Task.create({
        title,
        event: bodyEventId,
        assignedTo,
        priority,
        dueDate,
        notes,
        createdBy: user._id
      });
      await task.populate('event createdBy assignedTo', 'title date firstName lastName');
      return res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));

    } else if (req.method === 'PUT') {
      if (!id) throw new ApiError(400, 'Task ID is required');
      const task = await Task.findById(id);
      if (!task) throw new ApiError(404, 'Task not found');

      if (action === 'complete') {
        if (task.assignedTo.toString() !== user._id.toString()) {
          throw new ApiError(403, 'Not authorized');
        }
        task.isDone = true;
        task.doneAt = new Date();
        await task.save();
        await task.populate('event createdBy assignedTo', 'title date firstName lastName');
        return res.status(200).json(new ApiResponse(200, task, 'Task marked as done'));
      } else {
        const { title, priority, dueDate, notes } = req.body;
        if (title) task.title = title;
        if (priority) task.priority = priority;
        if (dueDate) task.dueDate = dueDate;
        if (notes) task.notes = notes;
        await task.save();
        await task.populate('event createdBy assignedTo', 'title date firstName lastName');
        return res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'));
      }

    } else if (req.method === 'DELETE') {
      if (!id) throw new ApiError(400, 'Task ID is required');
      const task = await Task.findById(id);
      if (!task) throw new ApiError(404, 'Task not found');
      await Task.findByIdAndDelete(id);
      return res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
