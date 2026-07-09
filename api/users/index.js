import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import User from '../../lib/models/User.js';
import VerificationApplication from '../../lib/models/VerificationApplication.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import { generatePassword } from '../../lib/passwordGenerator.js';
import cloudinary from '../../lib/cloudinary.js';
import { sendMail } from '../../lib/mailer.js';
import { credentialsTemplate } from '../../lib/emailTemplates.js';
import formidable from 'formidable';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
  },
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
        if (error) reject(new ApiError(400, error.message || 'Failed to upload profile photo'));
        else resolve(result);
      }
    );
  });
};

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

    const { id, type, search, role, verified } = req.query;

    if (req.method === 'GET') {
      if (type === 'stats') {
        const totalUsers = await User.countDocuments();
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        return res.status(200).json(new ApiResponse(200, { totalUsers, totalFaculty, totalStudents }, 'Stats fetched successfully'));
      }

      if (type === 'students') {
        authorize(user, 'faculty', 'admin', 'superadmin');
        const filter = { role: 'student', isVerified: true, isActive: true };

        if (search) {
          const regex = new RegExp(search, 'i');
          filter.$or = [
            { registrationNumber: regex },
            { firstName: regex },
            { lastName: regex },
            { officialEmail: regex }
          ];
        }

        const students = await User.find(filter)
          .select('firstName lastName registrationNumber officialEmail')
          .sort({ firstName: 1, lastName: 1 });

        return res.status(200).json(new ApiResponse(200, students, 'Students fetched successfully'));
      }

      if (type === 'faculty') {
        authorize(user, 'faculty', 'admin', 'superadmin');
        const filter = { role: 'faculty', isVerified: true, isActive: true };

        if (search) {
          const regex = new RegExp(search, 'i');
          filter.$or = [
            { employeeId: regex },
            { firstName: regex },
            { lastName: regex },
            { officialEmail: regex }
          ];
        }

        const faculty = await User.find(filter)
          .select('firstName lastName employeeId officialEmail department designation')
          .sort({ firstName: 1, lastName: 1 });

        return res.status(200).json(new ApiResponse(200, faculty, 'Faculty fetched successfully'));
      }

      // Admin only methods
      authorize(user, 'admin', 'superadmin');

      if (id) {
        const targetUser = await User.findById(id);
        if (!targetUser) throw new ApiError(404, 'User not found');
        return res.status(200).json(new ApiResponse(200, targetUser, 'User fetched successfully'));
      } else {
        const filter = {};
        if (role) filter.role = role;
        if (verified === 'true') filter.isVerified = true;
        if (verified === 'false') filter.isVerified = false;

        const users = await User.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
      }

    } else if (req.method === 'POST') {
      // Create user (admin only)
      authorize(user, 'admin', 'superadmin');

      const form = formidable();
      const [fields] = await form.parse(req);

      const roleBody = fields.role?.[0];
      const firstName = fields.firstName?.[0];
      const lastName = fields.lastName?.[0];
      const personalEmail = fields.personalEmail?.[0];
      const officialEmail = fields.officialEmail?.[0];
      const phone = fields.phone?.[0];
      const registrationNumber = fields.registrationNumber?.[0];
      const program = fields.program?.[0];
      const degree = fields.degree?.[0];
      const semester = fields.semester?.[0];
      const section = fields.section?.[0];
      const employeeId = fields.employeeId?.[0];
      const department = fields.department?.[0];
      const designation = fields.designation?.[0];
      const coordinatorRole = fields.coordinatorRole?.[0];

      if (!roleBody || !firstName || !lastName || !personalEmail) {
        throw new ApiError(400, 'Required user creation fields are missing');
      }

      const orConditions = [{ personalEmail: personalEmail.toLowerCase() }];
      if (officialEmail) orConditions.push({ officialEmail: officialEmail.toLowerCase() });
      if (registrationNumber) orConditions.push({ registrationNumber: registrationNumber.toUpperCase() });
      if (employeeId) orConditions.push({ employeeId: employeeId.toUpperCase() });

      const existingUser = await User.findOne({ $or: orConditions });
      if (existingUser) {
        throw new ApiError(400, 'User with this email, registration number, or employee ID already exists');
      }

      const tempPassword = generatePassword();
      const userData = {
        role: roleBody,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalEmail: personalEmail.toLowerCase(),
        officialEmail: officialEmail?.toLowerCase(),
        phone: phone?.trim() || '',
        password: tempPassword,
        mustChangePassword: true,
        isVerified: true,
      };

      if (roleBody === 'student') {
        userData.registrationNumber = registrationNumber?.toUpperCase();
        userData.program = program || '';
        userData.degree = degree || '';
        userData.semester = semester || '';
        userData.section = section || '';
      } else if (roleBody === 'faculty') {
        userData.employeeId = employeeId?.toUpperCase();
        userData.department = department || '';
        userData.designation = designation || '';
        userData.coordinatorRole = coordinatorRole || '';
      }

      const createdUser = await User.create(userData);

      const html = credentialsTemplate({
        name: createdUser.firstName,
        email: createdUser.personalEmail,
        tempPassword,
        role: roleBody,
      });

      const mailResult = await sendMail({
        to: createdUser.personalEmail,
        subject: `Your ${roleBody} Portal Account Credentials`,
        html,
      });

      if (!mailResult.success) {
        console.error('Failed to send credentials email for user:', createdUser.personalEmail);
      }

      return res.status(201).json(new ApiResponse(201, { user: createdUser }, 'User created successfully. Temporary password has been generated.'));

    } else if (req.method === 'PUT') {
      if (type === 'profile') {
        // Update user profile (self)
        const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
        const [fields, files] = await form.parse(req);

        const targetUser = await User.findById(user._id);
        if (!targetUser) throw new ApiError(404, 'User not found');

        const firstName = fields.firstName?.[0];
        const lastName = fields.lastName?.[0];
        const personalEmail = fields.personalEmail?.[0];
        const phone = fields.phone?.[0];
        const program = fields.program?.[0];
        const degree = fields.degree?.[0];
        const semester = fields.semester?.[0];
        const section = fields.section?.[0];
        const department = fields.department?.[0];
        const designation = fields.designation?.[0];
        const coordinatorRole = fields.coordinatorRole?.[0];

        if (firstName) targetUser.firstName = firstName.trim();
        if (lastName !== undefined) targetUser.lastName = lastName ? lastName.trim() : 'User';
        if (personalEmail) targetUser.personalEmail = personalEmail.toLowerCase().trim();
        if (phone !== undefined) targetUser.phone = phone.trim();

        if (targetUser.role === 'student') {
          if (program !== undefined) targetUser.program = program;
          if (degree !== undefined) targetUser.degree = degree;
          if (semester !== undefined) targetUser.semester = semester;
          if (section !== undefined) targetUser.section = section;
        }

        if (['faculty', 'admin', 'superadmin'].includes(targetUser.role)) {
          if (department !== undefined) targetUser.department = department;
          if (designation !== undefined) targetUser.designation = designation;
          if (coordinatorRole !== undefined) targetUser.coordinatorRole = coordinatorRole;
        }

        let oldProfilePhotoPublicId;
        if (files.profilePhoto && files.profilePhoto[0]) {
          oldProfilePhotoPublicId = targetUser.profilePhotoPublicId;
          const result = await uploadToCloudinary(files.profilePhoto[0].filepath, {
            folder: 'sca-ems/profiles',
            public_id: `profile_${targetUser._id}`,
            overwrite: true,
            invalidate: true,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });
          targetUser.profilePhotoUrl = result.secure_url;
          targetUser.profilePhotoPublicId = result.public_id;
        }

        await targetUser.save();

        if (oldProfilePhotoPublicId && oldProfilePhotoPublicId !== targetUser.profilePhotoPublicId) {
          await cloudinary.uploader.destroy(oldProfilePhotoPublicId);
        }

        return res.status(200).json(new ApiResponse(200, targetUser, 'Profile updated successfully'));
      }

      // Update user (admin only)
      authorize(user, 'admin', 'superadmin');
      if (!id) throw new ApiError(400, 'User ID is required');

      const targetUser = await User.findById(id);
      if (!targetUser) throw new ApiError(404, 'User not found');

      const form = formidable();
      const [fields] = await form.parse(req);

      const firstName = fields.firstName?.[0];
      const lastName = fields.lastName?.[0];
      const personalEmail = fields.personalEmail?.[0];
      const officialEmail = fields.officialEmail?.[0];
      const phone = fields.phone?.[0];
      const isActive = fields.isActive?.[0];
      const registrationNumber = fields.registrationNumber?.[0];
      const program = fields.program?.[0];
      const degree = fields.degree?.[0];
      const semester = fields.semester?.[0];
      const section = fields.section?.[0];
      const employeeId = fields.employeeId?.[0];
      const department = fields.department?.[0];
      const designation = fields.designation?.[0];

      if (firstName) targetUser.firstName = firstName;
      if (lastName) targetUser.lastName = lastName;
      if (personalEmail) targetUser.personalEmail = personalEmail;
      if (officialEmail) targetUser.officialEmail = officialEmail;
      if (phone) targetUser.phone = phone;
      if (isActive !== undefined) targetUser.isActive = isActive === 'true';

      if (targetUser.role === 'student') {
        if (registrationNumber) targetUser.registrationNumber = registrationNumber.toUpperCase();
        if (program) targetUser.program = program;
        if (degree) targetUser.degree = degree;
        if (semester) targetUser.semester = semester;
        if (section) targetUser.section = section;
      } else if (targetUser.role === 'faculty') {
        if (employeeId) targetUser.employeeId = employeeId.toUpperCase();
        if (department) targetUser.department = department;
        if (designation) targetUser.designation = designation;
      }

      await targetUser.save();
      return res.status(200).json(new ApiResponse(200, targetUser, 'User updated successfully'));

    } else if (req.method === 'DELETE') {
      authorize(user, 'admin', 'superadmin');
      if (!id) throw new ApiError(400, 'User ID is required');

      const targetUser = await User.findById(id);
      if (!targetUser) throw new ApiError(404, 'User not found');

      if (targetUser.profilePhotoPublicId) {
        await cloudinary.uploader.destroy(targetUser.profilePhotoPublicId);
      }

      await User.findByIdAndDelete(id);
      await VerificationApplication.deleteMany({ user: id });

      return res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
