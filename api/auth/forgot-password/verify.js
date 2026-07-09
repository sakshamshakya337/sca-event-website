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
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'Missing reset token');

    const hashedToken = hashValue(token);
    const userDoc = await User.collection.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!userDoc) throw new ApiError(400, 'Reset link is invalid or has expired.');

    return res.status(200).json(new ApiResponse(200, { valid: true, name: `${userDoc.firstName} ${userDoc.lastName}` }, 'Token is valid.'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
