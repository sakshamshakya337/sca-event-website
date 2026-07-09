import { connectDB } from '../../../lib/db.js';
import User from '../../../lib/models/User.js';
import { ApiError, ApiResponse } from '../../../lib/response.js';
import { sendMail } from '../../../lib/mailer.js';
import { resetPasswordTemplate } from '../../../lib/emailTemplates.js';
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
    const { identifier, role, securityAnswer } = req.body;
    if (!identifier || !role || !securityAnswer) {
      throw new ApiError(400, 'Missing registration fields');
    }

    const rawId = identifier.trim();
    const normalizedId = rawId.toUpperCase();

    let userId = null;
    if (role === 'student') {
      const found = await User.findOne({
        role: 'student',
        registrationNumber: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('_id isActive');
      if (!found && normalizedId !== rawId) {
        const found2 = await User.findOne({ role: 'student', registrationNumber: normalizedId }).select('_id isActive');
        if (found2) { userId = found2._id; }
      } else if (found) {
        userId = found._id;
        if (found.isActive === false) throw new ApiError(403, 'Account deactivated.');
      }
    } else {
      const found = await User.findOne({
        role: 'faculty',
        employeeId: { $regex: new RegExp(`^${rawId}$`, 'i') }
      }).select('_id isActive');
      if (!found && normalizedId !== rawId) {
        const found2 = await User.findOne({ role: 'faculty', employeeId: normalizedId }).select('_id isActive');
        if (found2) userId = found2._id;
      } else if (found) {
        userId = found._id;
        if (found.isActive === false) throw new ApiError(403, 'Account deactivated.');
      }
    }

    if (!userId) {
      throw new ApiError(404, 'No account found with that ID. Please check your registration number.');
    }

    const userDoc = await User.collection.findOne({ _id: userId });
    if (!userDoc) {
      throw new ApiError(404, 'No account found with that ID.');
    }
    if (userDoc.isActive === false) {
      throw new ApiError(403, 'This account has been deactivated. Contact your administrator.');
    }

    if (!userDoc.securityQuestion || !userDoc.securityAnswer) {
      throw new ApiError(400, 'No security question set for this account. Please set one in your profile settings first.');
    }

    const answerHash = hashValue(securityAnswer);
    if (answerHash !== userDoc.securityAnswer) {
      throw new ApiError(401, 'Incorrect security answer.');
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashValue(plainToken);

    await User.updateOne({ _id: userId }, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000)
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/forgot-password?token=${plainToken}&step=3`;

    const html = resetPasswordTemplate({
      name: userDoc.firstName,
      resetLink,
    });

    const mailResult = await sendMail({
      to: userDoc.personalEmail,
      subject: 'Password Reset Request — SCA Portal',
      html,
    });

    if (!mailResult.success) {
      throw new ApiError(500, 'Failed to send password reset email. Please try again later.');
    }

    const maskedEmail = userDoc.personalEmail.replace(/(.{2}).+(@.+)/, '$1***$2');
    return res.status(200).json(new ApiResponse(200, { maskedEmail }, 'Identity verified. A reset link has been sent to your email.'));
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
