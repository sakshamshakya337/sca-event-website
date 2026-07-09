import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import VerificationApplication from '../../lib/models/VerificationApplication.js';
import User from '../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import { generateRefNumber } from '../../lib/generateRefNumber.js';
import cloudinary from '../../lib/cloudinary.js';
import { sendMail } from '../../lib/mailer.js';
import { verificationApprovedTemplate, verificationRejectedTemplate } from '../../lib/emailTemplates.js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadToCloudinary = async (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const user = await protect(req);

    const { id, type, status } = req.query;

    if (req.method === 'POST') {
      // Check if user already has pending application
      const existingApplication = await VerificationApplication.findOne({
        user: user._id,
        status: 'pending'
      });

      if (existingApplication) {
        throw new ApiError(400, 'You already have a pending verification application');
      }

      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [, files] = await form.parse(req);

      const referenceNumber = generateRefNumber();
      const applicationData = {
        user: user._id,
        referenceNumber
      };

      if (files.universityId && files.universityId[0]) {
        const result = await uploadToCloudinary(files.universityId[0].filepath, 'sca-verification');
        applicationData.universityIdUrl = result.secure_url;
        applicationData.universityIdPublicId = result.public_id;
      }

      if (files.profilePhoto && files.profilePhoto[0]) {
        const result = await uploadToCloudinary(files.profilePhoto[0].filepath, 'sca-verification');
        applicationData.profilePhotoUrl = result.secure_url;
        applicationData.profilePhotoPublicId = result.public_id;
      }

      const application = await VerificationApplication.create(applicationData);
      return res.status(201).json(new ApiResponse(201, application, 'Application submitted successfully'));

    } else if (req.method === 'GET') {
      if (type === 'my') {
        const application = await VerificationApplication.findOne({ user: user._id })
          .sort({ createdAt: -1 })
          .populate('user', 'firstName lastName role')
          .populate('reviewedBy', 'firstName lastName');
        return res.status(200).json(new ApiResponse(200, application, 'Application fetched successfully'));
      }

      // Admin routes
      authorize(user, 'admin', 'superadmin');

      if (id) {
        const application = await VerificationApplication.findById(id)
          .populate('user')
          .populate('reviewedBy', 'firstName lastName');
        if (!application) throw new ApiError(404, 'Application not found');
        return res.status(200).json(new ApiResponse(200, application, 'Application fetched successfully'));
      } else {
        const filter = {};
        if (status) filter.status = status;
        const applications = await VerificationApplication.find(filter)
          .populate('user', 'firstName lastName role registrationNumber employeeId')
          .populate('reviewedBy', 'firstName lastName')
          .sort({ createdAt: -1 });

        const validApplications = applications.filter(app => app.user !== null);
        return res.status(200).json(new ApiResponse(200, validApplications, 'Applications fetched successfully'));
      }

    } else if (req.method === 'PUT') {
      authorize(user, 'admin', 'superadmin');
      if (!id) throw new ApiError(400, 'Application ID is required');

      const application = await VerificationApplication.findById(id).populate('user');
      if (!application) throw new ApiError(404, 'Application not found');

      // Check actions: approve or reject
      const form = formidable();
      const [fields] = await form.parse(req);
      const action = req.query.action || fields.action?.[0];
      const adminNotes = fields.adminNotes?.[0];
      const checklistJson = fields.checklist?.[0];
      const checklist = checklistJson ? JSON.parse(checklistJson) : undefined;
      const rejectionReason = fields.rejectionReason?.[0];

      if (action === 'approve') {
        application.status = 'approved';
        application.reviewedBy = user._id;
        application.reviewedAt = new Date();
        if (adminNotes) application.adminNotes = adminNotes;
        if (checklist) application.checklist = checklist;

        const targetUser = await User.findById(application.user._id);
        targetUser.isVerified = true;
        await targetUser.save();

        await application.save();
        await application.populate('reviewedBy', 'firstName lastName');

        const html = verificationApprovedTemplate({
          name: `${targetUser.firstName} ${targetUser.lastName}`.trim(),
          role: targetUser.role,
        });

        sendMail({
          to: targetUser.personalEmail,
          subject: 'Account Verification Approved — SCA Portal',
          html,
        }).catch(err => console.error('Failed to send verification approval email:', err));

        return res.status(200).json(new ApiResponse(200, application, 'Application approved successfully'));

      } else if (action === 'reject') {
        application.status = 'rejected';
        application.reviewedBy = user._id;
        application.reviewedAt = new Date();
        application.rejectionReason = rejectionReason || adminNotes || '';
        if (adminNotes) application.adminNotes = adminNotes;
        if (checklist) application.checklist = checklist;

        await application.save();
        await application.populate('reviewedBy', 'firstName lastName');

        const targetUser = application.user;
        const html = verificationRejectedTemplate({
          name: `${targetUser.firstName} ${targetUser.lastName}`.trim(),
          role: targetUser.role,
          reason: rejectionReason || adminNotes || '',
        });

        sendMail({
          to: targetUser.personalEmail,
          subject: 'Account Verification Rejected — SCA Portal',
          html,
        }).catch(err => console.error('Failed to send verification rejection email:', err));

        return res.status(200).json(new ApiResponse(200, application, 'Application rejected successfully'));

      } else {
        throw new ApiError(400, 'Invalid action specified (must be approve or reject)');
      }

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
