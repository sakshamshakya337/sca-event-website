import { connectDB } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import { buildSignupDuplicateQuery } from '../../controllers/auth.controller.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const {
      role, firstName, lastName, personalEmail, phone, password,
      registrationNumber, program, degree, semester, section,
      employeeId, department, designation, officialEmail
    } = req.body;

    if (!role || !firstName || !lastName || !personalEmail || !password) {
      throw new ApiError(400, 'Required signup fields are missing');
    }

    const duplicateQuery = buildSignupDuplicateQuery({ role, personalEmail, officialEmail, registrationNumber, employeeId });
    const existingUser = Object.keys(duplicateQuery).length > 0
      ? await User.findOne(duplicateQuery)
      : null;

    if (existingUser) {
      throw new ApiError(400, 'User with this email or ID already exists');
    }

    const userData = {
      role: role.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.toLowerCase(),
      phone: phone?.trim() || '',
      password,
      isVerified: false,
      isActive: true,
      mustChangePassword: false
    };

    if (role === 'student') {
      if (!registrationNumber) throw new ApiError(400, 'Registration number is required for students');
      userData.registrationNumber = registrationNumber.toUpperCase();
      userData.program = program || '';
      userData.degree = degree || '';
      userData.semester = semester || '';
      userData.section = section || '';
    } else if (role === 'faculty') {
      if (!employeeId) throw new ApiError(400, 'Employee ID is required for faculty');
      userData.employeeId = employeeId.toUpperCase();
      userData.department = department || '';
      userData.designation = designation || '';
      if (officialEmail) userData.officialEmail = officialEmail.toLowerCase();
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json(new ApiResponse(201, { user: userResponse, token }, 'Signup successful'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
