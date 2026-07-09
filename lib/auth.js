import jwt from 'jsonwebtoken';
import { ApiError } from './response.js';
import User from './models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.Authorization?.startsWith('Bearer ')) {
    token = req.headers.Authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  if (user.passwordChangedAt) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedAt) {
      throw new ApiError(401, 'Password recently changed. Please log in again.');
    }
  }

  return user;
};

export const authorize = (user, ...roles) => {
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }
  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
};
