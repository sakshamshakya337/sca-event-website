import { connectDB } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

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

    const { email, password, role } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email/identifier and password are required');
    }

    const identifier = email.trim();
    const normalizedEmail = identifier.toLowerCase();
    const normalizedId = identifier.toUpperCase();

    let user;
    if (role?.toLowerCase() === 'student') {
      user = await User.findOne({ registrationNumber: normalizedId }).select('+password');
    } else {
      user = await User.findOne({
        $or: [
          { personalEmail: normalizedEmail },
          { officialEmail: normalizedEmail },
          { registrationNumber: normalizedId },
          { employeeId: normalizedId }
        ]
      }).select('+password');
    }

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Contact administrator.');
    }

    const now = Date.now();
    if (user.lockUntil && user.lockUntil > now) {
      const minutesLeft = Math.ceil((user.lockUntil - now) / 60000);
      throw new ApiError(429, `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`);
    }

    if (user.role !== 'admin' && user.role !== 'superadmin' && !user.isVerified) {
      throw new ApiError(403, 'Account not verified yet. Please wait for admin approval.');
    }

    const isMatch = user.password ? await user.comparePassword(password) : false;

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(now + LOCK_DURATION_MS);
        user.loginAttempts = 0;
        await user.save();
        throw new ApiError(429, 'Too many failed attempts. Account locked for 15 minutes.');
      }
      await user.save();
      throw new ApiError(401, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json(new ApiResponse(200, { user: userResponse, token }, 'Login successful'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
