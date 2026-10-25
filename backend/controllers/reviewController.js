import { Review } from '../models/Review.js';
import { Movie } from '../models/Movie.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get reviews for a specific movie
// @route   GET /api/movies/:movieId/reviews
// @access  Public
export const getMovieReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  const reviews = await Review.find({ movieId, moderationStatus: 'approved' })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { count: reviews.length, reviews }, 'Reviews fetched successfully')
  );
});

// @desc    Add or update a review for a movie
// @route   POST /api/movies/:movieId/reviews
// @access  Authenticated User
export const addReview = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { rating, comment, userId } = req.body;

  // Use authenticated user or fallback userId
  const effectiveUserId = req.user?._id || userId;
  if (!effectiveUserId) {
    throw new ApiError(401, 'Authentication required to post a review');
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5');
  }

  if (!comment || !comment.trim()) {
    throw new ApiError(400, 'Review comment is required');
  }

  // Check if movie exists
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new ApiError(404, 'Movie not found');
  }

  // Update existing review or create new one (upsert pattern)
  const review = await Review.findOneAndUpdate(
    { userId: effectiveUserId, movieId },
    { rating: numericRating, comment: comment.trim(), moderationStatus: 'approved' },
    { new: true, upsert: true, runValidators: true }
  );

  // Recalculate movie average rating
  const allReviews = await Review.find({ movieId, moderationStatus: 'approved' });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  movie.averageRating = Math.round(avg * 10) / 10;
  movie.totalRatings = allReviews.length;
  await movie.save();

  return res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Authenticated User / Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});
