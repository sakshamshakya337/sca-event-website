import { connectDB } from '../../lib/db.js';
import { protect } from '../../lib/auth.js';
import { ApiResponse } from '../../lib/response.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const user = await protect(req);

    if (req.method === 'GET') {
      return res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
    } else if (req.method === 'DELETE') {
      const User = (await import('../../lib/models/User.js')).default;
      if (user.isVerified) {
        return res.status(403).json({ success: false, message: 'Cannot delete a verified account via this endpoint.' });
      }
      await User.findByIdAndDelete(user._id);
      return res.status(200).json(new ApiResponse(200, null, 'Account deleted.'));
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
