import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const COOKIE_NAME = process.env.COOKIE_NAME || 'imovies_token';
const JWT_SECRET = process.env.JWT_SECRET || 'imovies_default_development_secret_change_in_production_key_32_chars';

// Protect routes - verifies JWT from HttpOnly cookie or Authorization header
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAME];

  // Also support Authorization: Bearer <token>
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please sign in to continue.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // If MongoDB is connected, fetch full active user document
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        throw new ApiError(401, 'User account associated with this token no longer exists.');
      }
      if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
        throw new ApiError(403, 'Your account has been suspended or deactivated.');
      }
      req.user = user;
    } else {
      // In offline/dev mode, construct user from verified token payload
      req.user = {
        _id: decoded.id,
        name: decoded.name || 'Demo User',
        email: decoded.email,
        role: decoded.role || 'user'
      };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
});
