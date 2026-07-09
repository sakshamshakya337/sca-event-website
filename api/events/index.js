import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import Event from '../../lib/models/Event.js';
import EventRegistration from '../../lib/models/EventRegistration.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import cloudinary from '../../lib/cloudinary.js';
import mongoose from 'mongoose';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const findEventByIdOrSlug = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await Event.findById(identifier);
  }
  return await Event.findOne({ slug: identifier });
};

const uploadToCloudinary = async (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(new ApiError(400, error.message || 'Failed to upload event image'));
        else resolve(result);
      }
    );
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const { id, type, status, action } = req.query;

    // Handle public static/detail endpoints first (no auth)
    if (req.method === 'GET' && type === 'approved') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const events = await Event.find({ 
        status: 'approved',
        startDate: { $gte: today }
      })
        .sort({ startDate: 1, createdAt: -1 })
        .select('title type startDate endDate time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery externalImageUrls isImportant slug')
        .populate('assignedFaculty', 'firstName lastName');
      return res.status(200).json(new ApiResponse(200, events, 'Approved events fetched successfully'));
    }

    if (req.method === 'GET' && type === 'all-public') {
      const events = await Event.find({ 
        status: { $in: ['approved', 'completed'] }
      })
        .sort({ startDate: -1, createdAt: -1 })
        .select('title type startDate endDate time venue description imageUrl registerLink registrationNotRequired registrationOpen gallery externalImageUrls isImportant status slug')
        .populate('assignedFaculty', 'firstName lastName');
      return res.status(200).json(new ApiResponse(200, events, 'All public events fetched successfully'));
    }

    if (req.method === 'GET' && type === 'detail' && id) {
      const event = await findEventByIdOrSlug(id);
      if (!event || !['approved', 'completed'].includes(event.status)) {
        throw new ApiError(404, 'Event not found');
      }
      const eventResponse = {
        _id: event._id,
        slug: event.slug,
        title: event.title,
        type: event.type,
        startDate: event.startDate,
        endDate: event.endDate,
        time: event.time,
        venue: event.venue,
        description: event.description,
        imageUrl: event.imageUrl,
        registerLink: event.registerLink,
        registrationNotRequired: event.registrationNotRequired,
        registrationOpen: event.registrationOpen,
        gallery: event.gallery,
        externalImageUrls: event.externalImageUrls,
        isImportant: event.isImportant,
        status: event.status,
        assignedFaculty: event.assignedFaculty
      };
      if (event.assignedFaculty.length > 0) {
        await event.populate('assignedFaculty', 'firstName lastName');
        eventResponse.assignedFaculty = event.assignedFaculty;
      }
      return res.status(200).json(new ApiResponse(200, eventResponse, 'Event fetched'));
    }

    if (req.method === 'GET' && type === 'registrations-count' && id) {
      const count = await EventRegistration.countDocuments({ event: id });
      return res.status(200).json(new ApiResponse(200, { count }, 'Count fetched'));
    }

    if (req.method === 'POST' && type === 'register' && id) {
      const event = await Event.findById(id).select('status registrationOpen registrationNotRequired title');
      if (!event) throw new ApiError(404, 'Event not found');
      if (event.status !== 'approved') throw new ApiError(400, 'Registrations are not open for this event');
      if (event.registrationNotRequired) throw new ApiError(400, 'This event does not require registration');
      if (!event.registrationOpen) throw new ApiError(400, 'Registrations are currently closed for this event');

      const form = formidable();
      const [fields] = await form.parse(req);

      const registrationNumber = fields.registrationNumber?.[0];
      const name = fields.name?.[0];
      const email = fields.email?.[0];
      const course = fields.course?.[0];
      const section = fields.section?.[0];
      const school = fields.school?.[0];
      const phone = fields.phone?.[0];
      const whatsapp = fields.whatsapp?.[0];

      if (!registrationNumber || !name || !email || !course || !section || !phone || !whatsapp) {
        throw new ApiError(400, 'Missing registration fields');
      }

      const existing = await EventRegistration.findOne({
        event: id,
        registrationNumber: registrationNumber.toUpperCase(),
      });
      if (existing) throw new ApiError(409, 'You have already registered for this event.');

      const registration = await EventRegistration.create({
        event: id,
        registrationNumber: registrationNumber.toUpperCase(),
        name,
        email,
        course,
        section,
        school: school || 'School of Computer Applications',
        phone,
        whatsapp
      });
      return res.status(201).json(new ApiResponse(201, { _id: registration._id }, 'Registered successfully!'));
    }

    // Require authentication beyond this point
    const user = await protect(req);

    if (req.method === 'GET') {
      if (type === 'stats') {
        let statsFilter = {};
        if (user.role === 'faculty') {
          statsFilter = {
            $or: [
              { createdBy: user._id },
              { assignedFaculty: user._id }
            ]
          };
        } else if (user.role === 'student') {
          statsFilter = { assignedStudents: user._id };
        }
        const totalEvents = await Event.countDocuments(statsFilter);
        const pendingEvents = await Event.countDocuments({ ...statsFilter, status: 'pending' });
        const approvedEvents = await Event.countDocuments({ ...statsFilter, status: 'approved' });
        const completedEvents = await Event.countDocuments({ ...statsFilter, status: 'completed' });
        return res.status(200).json(new ApiResponse(200, { totalEvents, pendingEvents, approvedEvents, completedEvents }, 'Stats fetched successfully'));
      }

      if (type === 'my') {
        authorize(user, 'faculty');
        const filter = {
          $or: [
            { createdBy: user._id },
            { assignedFaculty: user._id }
          ]
        };
        if (status) filter.status = status;
        const events = await Event.find(filter)
          .populate('createdBy', 'firstName lastName')
          .populate('assignedFaculty', 'firstName lastName')
          .populate('assignedStudents', 'firstName lastName')
          .sort({ startDate: -1 });
        return res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'));
      }

      if (type === 'registrations' && id) {
        const event = await Event.findById(id).select('createdBy assignedFaculty');
        if (!event) throw new ApiError(404, 'Event not found');

        const userIdStr = user._id.toString();
        const isAdmin = ['admin', 'superadmin'].includes(user.role);
        const isFaculty = user.role === 'faculty';
        const isCreator = event.createdBy?.toString() === userIdStr;
        const isAssigned = (event.assignedFaculty || []).some(f => f?.toString() === userIdStr);

        if (!isAdmin && !(isFaculty && (isCreator || isAssigned))) {
          throw new ApiError(403, 'Not authorised to view registrations for this event');
        }

        const registrations = await EventRegistration.find({ event: id }).sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, registrations, 'Registrations fetched'));
      }

      if (id) {
        const event = await findEventByIdOrSlug(id);
        if (!event) throw new ApiError(404, 'Event not found');

        await event.populate('createdBy', 'firstName lastName');
        await event.populate('approvedBy', 'firstName lastName');
        await event.populate('assignedFaculty', 'firstName lastName');
        await event.populate('assignedStudents', 'firstName lastName');

        const userIdStr = user._id.toString();
        const creatorId = event.createdBy ? (event.createdBy._id ?? event.createdBy).toString() : null;

        const isAuthorized = 
          ['admin', 'superadmin'].includes(user.role) ||
          creatorId === userIdStr ||
          (event.assignedFaculty || []).some(f => f && (f._id ?? f).toString() === userIdStr) ||
          (event.assignedStudents || []).some(s => s && (s._id ?? s).toString() === userIdStr);

        if (!isAuthorized) {
          throw new ApiError(403, 'Not authorized to view this event');
        }
        return res.status(200).json(new ApiResponse(200, event, 'Event fetched successfully'));
      } else {
        const filter = {};
        if (status) filter.status = status;
        if (req.query.eventType) filter.type = req.query.eventType;

        if (user.role === 'faculty') {
          filter.$or = [
            { createdBy: user._id },
            { assignedFaculty: user._id }
          ];
        } else if (user.role === 'student') {
          filter.assignedStudents = user._id;
        }

        const events = await Event.find(filter)
          .populate('createdBy', 'firstName lastName')
          .populate('approvedBy', 'firstName lastName')
          .populate('assignedFaculty', 'firstName lastName')
          .populate('assignedStudents', 'firstName lastName')
          .sort({ startDate: -1 });
        return res.status(200).json(new ApiResponse(200, events, 'Events fetched successfully'));
      }

    } else if (req.method === 'POST') {
      authorize(user, 'faculty', 'admin', 'superadmin');
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [fields, files] = await form.parse(req);

      const title = fields.title?.[0];
      const typeBody = fields.type?.[0];
      const startDate = fields.startDate?.[0];
      const endDate = fields.endDate?.[0];
      const time = fields.time?.[0];
      const venue = fields.venue?.[0];
      const expectedAudience = fields.expectedAudience?.[0];
      const description = fields.description?.[0];
      const registerLink = fields.registerLink?.[0];
      let assignedStudents = fields.assignedStudents || [];
      let externalImageUrls = fields.externalImageUrls || [];

      if (!title || !typeBody || !startDate || !endDate || !venue) {
        throw new ApiError(400, 'Missing required fields: title, type, startDate, endDate, venue');
      }

      const parsedAudience = expectedAudience ? Number(expectedAudience) : undefined;
      const isImportant = fields.isImportant?.[0] === 'true';
      const registrationNotRequired = fields.registrationNotRequired?.[0] === 'true';
      const registrationOpen = fields.registrationOpen?.[0] === 'true';

      let assignedFaculty = [];
      if (fields.assignedFaculty?.[0]) {
        try { assignedFaculty = JSON.parse(fields.assignedFaculty[0]); } catch { assignedFaculty = []; }
      }
      try { assignedStudents = typeof assignedStudents === 'string' ? JSON.parse(assignedStudents) : assignedStudents; } catch { assignedStudents = []; }

      let parsedExternalUrls = [];
      if (externalImageUrls?.[0]) {
        try {
          parsedExternalUrls = JSON.parse(externalImageUrls[0]);
          parsedExternalUrls = parsedExternalUrls.filter(url => url && url.trim().length > 0).slice(0, 10);
        } catch { parsedExternalUrls = []; }
      }

      const eventData = {
        title, type: typeBody, startDate, endDate, time, venue,
        expectedAudience: parsedAudience,
        description, registerLink,
        registrationNotRequired, registrationOpen, isImportant,
        status: 'pending',
        createdBy: user._id,
        assignedFaculty, assignedStudents,
        gallery: [],
        externalImageUrls: parsedExternalUrls
      };

      const bannerFile = files.image?.[0];
      if (bannerFile) {
        const result = await uploadToCloudinary(bannerFile.filepath, { folder: 'sca-ems/events' });
        eventData.imageUrl = result.secure_url;
        eventData.imagePublicId = result.public_id;
      }

      const galleryFiles = files.gallery || [];
      if (galleryFiles.length > 0) {
        const galleryUploads = await Promise.all(
          galleryFiles.map(f => uploadToCloudinary(f.filepath, { folder: 'sca-ems/events/gallery' }))
        );
        eventData.gallery = galleryUploads.map(r => ({ url: r.secure_url, publicId: r.public_id }));
      }

      const event = await Event.create(eventData);
      await event.populate('createdBy', 'firstName lastName');
      await event.populate('assignedFaculty', 'firstName lastName');
      return res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));

    } else if (req.method === 'PUT') {
      if (!id) throw new ApiError(400, 'Event ID/Slug is required');
      const event = await findEventByIdOrSlug(id);
      if (!event) throw new ApiError(404, 'Event not found');

      if (action === 'approve') {
        authorize(user, 'admin', 'superadmin');
        event.status = 'approved';
        event.approvedBy = user._id;
        event.approvedAt = new Date();
        await event.save();
        await event.populate('approvedBy', 'firstName lastName');
        await event.populate('assignedFaculty', 'firstName lastName');
        await event.populate('assignedStudents', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, event, 'Event approved successfully'));
      }

      if (action === 'reject') {
        authorize(user, 'admin', 'superadmin');
        const form = formidable();
        const [fields] = await form.parse(req);
        const reason = fields.reason?.[0];
        event.status = 'rejected';
        event.rejectedReason = reason;
        await event.save();
        await event.populate('assignedFaculty', 'firstName lastName');
        await event.populate('assignedStudents', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, event, 'Event rejected successfully'));
      }

      if (action === 'complete') {
        if (event.createdBy.toString() !== user._id.toString() && !['admin', 'superadmin'].includes(user.role)) {
          throw new ApiError(403, 'Not authorized');
        }
        event.status = 'completed';
        await event.save();
        await event.populate('assignedFaculty', 'firstName lastName');
        await event.populate('assignedStudents', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, event, 'Event marked as completed'));
      }

      if (action === 'assign-faculty') {
        authorize(user, 'admin', 'superadmin');
        const form = formidable();
        const [fields] = await form.parse(req);
        const facultyId = fields.facultyId?.[0];
        const subaction = fields.action?.[0];

        if (subaction === 'remove') {
          event.assignedFaculty = event.assignedFaculty.filter(fid => fid.toString() !== facultyId);
        } else if (facultyId) {
          if (!event.assignedFaculty.some(fid => fid.toString() === facultyId)) {
            event.assignedFaculty.push(facultyId);
          }
        } else if (fields.facultyIds) {
          event.assignedFaculty = fields.facultyIds;
        }
        await event.save();
        await event.populate('assignedFaculty', 'firstName lastName department designation');
        await event.populate('assignedStudents', 'firstName lastName registrationNumber');
        await event.populate('createdBy', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, event, 'Faculty updated successfully'));
      }

      if (action === 'assign-students') {
        authorize(user, 'admin', 'superadmin', 'faculty');
        const form = formidable();
        const [fields] = await form.parse(req);
        let studentIds = fields.studentIds || [];
        try { studentIds = typeof studentIds === 'string' ? JSON.parse(studentIds) : studentIds; } catch { studentIds = []; }
        event.assignedStudents = studentIds;
        await event.save();
        await event.populate('assignedFaculty', 'firstName lastName');
        await event.populate('assignedStudents', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, event, 'Students assigned successfully'));
      }

      // Default updateEvent logic
      if (event.createdBy.toString() !== user._id.toString() && !['admin', 'superadmin'].includes(user.role)) {
        throw new ApiError(403, 'Not authorized to update this event');
      }

      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [fields, files] = await form.parse(req);

      const title = fields.title?.[0];
      const typeBody = fields.type?.[0];
      const startDate = fields.startDate?.[0];
      const endDate = fields.endDate?.[0];
      const time = fields.time?.[0];
      const venue = fields.venue?.[0];
      const expectedAudience = fields.expectedAudience?.[0];
      const description = fields.description?.[0];
      const registerLink = fields.registerLink?.[0];
      let assignedFaculty = fields.assignedFaculty || [];
      let assignedStudents = fields.assignedStudents || [];
      let externalImageUrls = fields.externalImageUrls || [];

      const isImportant = fields.isImportant?.[0] === 'true';
      const registrationNotRequired = fields.registrationNotRequired?.[0] === 'true';
      const registrationOpen = fields.registrationOpen?.[0] === 'true';
      const parsedAudience = expectedAudience ? Number(expectedAudience) : undefined;

      if (title) event.title = title;
      if (typeBody) event.type = typeBody;
      if (startDate) event.startDate = startDate;
      if (endDate) event.endDate = endDate;
      if (time !== undefined) event.time = time;
      if (venue) event.venue = venue;
      if (parsedAudience !== undefined) event.expectedAudience = parsedAudience;
      if (description !== undefined) event.description = description;
      if (registerLink !== undefined) event.registerLink = registerLink;
      event.isImportant = isImportant;
      event.registrationNotRequired = registrationNotRequired;
      event.registrationOpen = registrationOpen;

      try { assignedFaculty = typeof assignedFaculty === 'string' ? JSON.parse(assignedFaculty) : assignedFaculty; } catch { /* ignore */ }
      try { assignedStudents = typeof assignedStudents === 'string' ? JSON.parse(assignedStudents) : assignedStudents; } catch { /* ignore */ }
      if (assignedFaculty.length > 0) event.assignedFaculty = assignedFaculty;
      if (assignedStudents.length > 0) event.assignedStudents = assignedStudents;

      let parsedExternalUrls = [];
      if (externalImageUrls?.[0]) {
        try {
          parsedExternalUrls = JSON.parse(externalImageUrls[0]);
          parsedExternalUrls = parsedExternalUrls.filter(url => url && url.trim().length > 0).slice(0, 10);
        } catch { parsedExternalUrls = []; }
      }
      event.externalImageUrls = parsedExternalUrls.length > 0 ? parsedExternalUrls : (event.externalImageUrls || []);

      if (!['admin', 'superadmin'].includes(user.role) && event.status === 'approved') {
        event.status = 'pending';
        event.approvedBy = undefined;
        event.approvedAt = undefined;
      }

      const bannerFile = files.image?.[0];
      const oldBannerPublicId = event.imagePublicId;
      if (bannerFile) {
        const result = await uploadToCloudinary(bannerFile.filepath, { folder: 'sca-ems/events' });
        event.imageUrl = result.secure_url;
        event.imagePublicId = result.public_id;
      }

      const galleryFiles = files.gallery || [];
      if (galleryFiles.length > 0) {
        const remaining = 6 - (event.gallery?.length ?? 0);
        if (remaining > 0) {
          const toUpload = galleryFiles.slice(0, remaining);
          const uploaded = await Promise.all(
            toUpload.map(f => uploadToCloudinary(f.filepath, { folder: 'sca-ems/events/gallery' }))
          );
          event.gallery = [...(event.gallery ?? []), ...uploaded.map(r => ({ url: r.secure_url, publicId: r.public_id }))];
        }
      }

      if (fields.removeGalleryIds?.[0]) {
        let toRemove = [];
        try { toRemove = JSON.parse(fields.removeGalleryIds[0]); } catch { /* ignore */ }
        if (toRemove.length > 0) {
          const kept = (event.gallery ?? []).filter(g => !toRemove.includes(g.publicId));
          Promise.all(toRemove.map(pid => cloudinary.uploader.destroy(pid))).catch(console.error);
          event.gallery = kept;
        }
      }

      await event.save();

      if (bannerFile && oldBannerPublicId && oldBannerPublicId !== event.imagePublicId) {
        cloudinary.uploader.destroy(oldBannerPublicId).catch(console.error);
      }

      await event.populate('createdBy', 'firstName lastName');
      await event.populate('assignedFaculty', 'firstName lastName');
      await event.populate('assignedStudents', 'firstName lastName');
      return res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'));

    } else if (req.method === 'PATCH' && action === 'registration-toggle') {
      if (!id) throw new ApiError(400, 'Event ID is required');
      const event = await Event.findById(id);
      if (!event) throw new ApiError(404, 'Event not found');

      const userIdStr = user._id.toString();
      const isAdmin = ['admin', 'superadmin'].includes(user.role);
      const isCreator = event.createdBy?.toString() === userIdStr;
      const isAssigned = (event.assignedFaculty || []).some(f => f?.toString() === userIdStr);

      if (!isAdmin && !isCreator && !isAssigned) {
        throw new ApiError(403, 'Not authorised to toggle registration for this event');
      }

      const form = formidable();
      const [fields] = await form.parse(req);
      const open = fields.open?.[0] === 'true';

      event.registrationOpen = open;
      await event.save();
      return res.status(200).json(new ApiResponse(200, { registrationOpen: event.registrationOpen }, 'Registration toggled'));

    } else if (req.method === 'DELETE') {
      if (!id) throw new ApiError(400, 'Event ID/Slug is required');
      const event = await findEventByIdOrSlug(id);
      if (!event) throw new ApiError(404, 'Event not found');

      if (event.createdBy.toString() !== user._id.toString() && !['admin', 'superadmin'].includes(user.role)) {
        throw new ApiError(403, 'Not authorized to delete this event');
      }

      await Event.findByIdAndDelete(event._id);
      return res.status(200).json(new ApiResponse(200, null, 'Event deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
