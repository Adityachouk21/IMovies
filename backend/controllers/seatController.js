import { getShowSeatMap, acquireSeatLocks, releaseSeatLocks } from '../services/seatLockService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get complete seat layout, pricing, booked seats, and active locks for a show
// @route   GET /api/shows/:showId/seats
// @access  Public (Optional Auth for identifying user's own locks)
export const getShowSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const currentUserId = req.user?._id || req.query.userId || null;

  const data = await getShowSeatMap(showId, currentUserId);
  return res.status(200).json(new ApiResponse(200, data, 'Seat map retrieved successfully'));
});

// @desc    Temporarily lock selected seats atomically for current user
// @route   POST /api/shows/:showId/seat-locks
// @access  Authenticated User
export const lockSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const { seats } = req.body;
  const userId = req.user._id;

  const result = await acquireSeatLocks(showId, seats, userId);

  // Broadcast real-time lock update to all clients in the show room via Socket.io
  const io = req.app.get('io');
  if (io) {
    io.to(`show_${showId}`).emit('seats_locked', {
      showId,
      seats,
      lockedBy: userId,
      expiresAt: result.expiresAt
    });
  }

  return res.status(200).json(new ApiResponse(200, result, 'Seats reserved successfully for 8 minutes'));
});

// @desc    Release locked seats
// @route   DELETE /api/shows/:showId/seat-locks
// @access  Authenticated User
export const releaseSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const { seats } = req.body;
  const userId = req.user._id;

  await releaseSeatLocks(showId, seats, userId);

  // Broadcast release update via Socket.io
  const io = req.app.get('io');
  if (io) {
    io.to(`show_${showId}`).emit('seats_released', {
      showId,
      seats: seats || [],
      releasedBy: userId
    });
  }

  return res.status(200).json(new ApiResponse(200, null, 'Seats released successfully'));
});
