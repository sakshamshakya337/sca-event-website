import { connectDB } from '../../lib/db.js';
import User from '../../lib/models/User.js';

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
    const { identifier, role } = req.body;
    if (!identifier || !role) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const rawId = identifier.trim();
    const normalizedId = rawId.toUpperCase();
    let user;

    if (role === 'student') {
      user = await User.findOne({
        role: 'student',
        registrationNumber: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('securityQuestion isActive');
      if (!user) {
        user = await User.findOne({ role: 'student', registrationNumber: normalizedId })
          .select('securityQuestion isActive');
      }
    } else {
      user = await User.findOne({
        role: 'faculty',
        employeeId: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('securityQuestion isActive');
      if (!user) {
        user = await User.findOne({ role: 'faculty', employeeId: normalizedId })
          .select('securityQuestion isActive');
      }
    }

    if (!user || user.isActive === false || !user.securityQuestion) {
      return res.status(200).json({ success: true, data: { securityQuestion: null } });
    }

    return res.status(200).json({ success: true, data: { securityQuestion: user.securityQuestion } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
