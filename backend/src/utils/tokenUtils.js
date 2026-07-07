import jwt from 'jsonwebtoken';

// Generate temporary password
export const generateTempPassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate reset token (expires in 15 min)
export const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Verify reset token
export const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') return null;
    return decoded;
  } catch (error) {
    return null;  // expired or invalid
  }
};
