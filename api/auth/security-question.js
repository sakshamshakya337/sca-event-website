import { connectDB } from '../../lib/db.js';
import { protect } from '../../lib/auth.js';
import User from '../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import crypto from 'crypto';

const hashValue = (value) =>
  crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const currentUser = await protect(req);

    if (req.method === 'GET') {
      const user = await User.findById(currentUser._id).select('securityQuestion');
      return res.status(200).json(new ApiResponse(200, { securityQuestion: user?.securityQuestion || null }, 'Fetched security question'));
    } else if (req.method === 'POST') {
      const { question, answer } = req.body;
      if (!question || !answer || question.trim().length < 5 || answer.trim().length < 1) {
        throw new ApiError(400, 'Question must be min 5 and Answer min 1 character long');
      }
      const user = await User.findById(currentUser._id);
      if (!user) throw new ApiError(404, 'User not found');

      user.securityQuestion = question.trim();
      user.securityAnswer = hashValue(answer);
      await user.save();

      return res.status(200).json(new ApiResponse(200, { securityQuestion: user.securityQuestion }, 'Security question saved.'));
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
