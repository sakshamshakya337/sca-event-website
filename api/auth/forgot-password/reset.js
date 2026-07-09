import { connectDB } from '../../../lib/db.js';
import User from '../../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../../lib/response.js';
import crypto from 'crypto';

const hashValue = (value) =>
  crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');

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
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      throw new ApiError(400, 'Token and a password of at least 8 characters are required');
    }

    const hashedToken = hashValue(token);
    const userDoc = await User.collection.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!userDoc) throw new ApiError(400, 'Reset link is invalid or has expired. Please request a new one.');

    const user = await User.findById(userDoc._id).select('+password');
    if (!user) throw new ApiError(400, 'Reset link is invalid or has expired.');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.mustChangePassword = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. You can now log in.'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
