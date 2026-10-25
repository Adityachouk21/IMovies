import { ApiError } from '../utils/ApiError.js';

// Verifies that the authenticated user possesses the 'admin' role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  if (req.user.role !== 'admin') {
    return next(
      new ApiError(403, 'Access denied. You do not have administrator permissions to perform this action.')
    );
  }

  next();
};
