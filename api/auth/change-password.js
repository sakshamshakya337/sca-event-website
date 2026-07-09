import { connectDB } from '../../lib/db.js';
import { protect } from '../../lib/auth.js';
import User from '../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
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
    const currentUser = await protect(req);

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    const user = await User.findById(currentUser._id).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json(new ApiResponse(200, { user: userResponse, token }, 'Password changed successfully'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
