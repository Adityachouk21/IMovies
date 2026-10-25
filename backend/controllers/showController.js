import mongoose from 'mongoose';
import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Movie } from '../models/Movie.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSampleShows } from '../utils/sampleData.js';

// @desc    Get shows with filtering by movie, theater, date, and city
// @route   GET /api/shows
// @access  Public
export const getShows = asyncHandler(async (req, res) => {
  const { movieId, theaterId, city, date } = req.query;

  if (mongoose.connection.readyState !== 1) {
    let shows = getSampleShows();

    if (movieId) {
      shows = shows.filter((s) => s.movieId._id === movieId || s.movieId.title.toLowerCase().includes(movieId.toLowerCase()));
    }

    if (theaterId) {
      shows = shows.filter((s) => s.theaterId._id === theaterId);
    }

    if (city) {
      shows = shows.filter((s) => s.theaterId.city.toLowerCase() === city.toLowerCase());
    }

    return res.status(200).json(
      new ApiResponse(200, { count: shows.length, shows }, 'Shows retrieved successfully')
    );
  }

  const query = { showStatus: { $ne: 'cancelled' } };

  if (movieId) {
    query.movieId = movieId;
  }

  if (theaterId) {
    query.theaterId = theaterId;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const shows = await Show.find(query)
    .populate('movieId', 'title posterUrl duration language genre ageRating')
    .populate('theaterId', 'name address city facilities')
    .populate('screenId', 'name screenType totalSeats')
    .sort({ startTime: 1 })
    .lean();

  const filteredShows = city
    ? shows.filter((s) => s.theaterId?.city?.toLowerCase() === city.toLowerCase())
    : shows;

  return res.status(200).json(
    new ApiResponse(200, { count: filteredShows.length, shows: filteredShows }, 'Shows retrieved successfully')
  );
});

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState !== 1) {
    const show = getSampleShows().find((s) => s._id === id) || getSampleShows()[0];
    if (!show) throw new ApiError(404, `Show with ID ${id} not found`);
    return res.status(200).json(new ApiResponse(200, show, 'Show details retrieved successfully'));
  }

  const show = await Show.findById(id)
    .populate('movieId')
    .populate('theaterId')
    .populate('screenId')
    .lean();

  if (!show) {
    throw new ApiError(404, `Show with ID ${id} not found`);
  }

  return res.status(200).json(new ApiResponse(200, show, 'Show details retrieved successfully'));
});

// @desc    Create a new show with conflict detection
// @route   POST /api/shows
// @access  Admin
export const createShow = asyncHandler(async (req, res) => {
  const { movieId, theaterId, screenId, startTime, endTime, seatPricing } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    throw new ApiError(400, 'Show start time must be before end time');
  }

  const [movie, screen] = await Promise.all([
    Movie.findById(movieId),
    Screen.findById(screenId)
  ]);

  if (!movie) throw new ApiError(404, 'Referenced Movie not found');
  if (!screen) throw new ApiError(404, 'Referenced Screen not found');

  const conflictingShow = await Show.findOne({
    screenId,
    showStatus: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } }
    ]
  });

  if (conflictingShow) {
    throw new ApiError(
      409,
      `Scheduling conflict: An active show is already scheduled on ${screen.name} between ${conflictingShow.startTime.toISOString()} and ${conflictingShow.endTime.toISOString()}`
    );
  }

  const defaultPricing = {
    Silver: seatPricing?.Silver || 180,
    Gold: seatPricing?.Gold || 280,
    Premium: seatPricing?.Premium || 420
  };

  const show = await Show.create({
    movieId,
    theaterId,
    screenId,
    startTime: start,
    endTime: end,
    seatPricing: defaultPricing
  });

  return res.status(201).json(new ApiResponse(201, show, 'Show scheduled successfully'));
});

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Admin
export const updateShow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const show = await Show.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!show) throw new ApiError(404, `Show with ID ${id} not found`);
  return res.status(200).json(new ApiResponse(200, show, 'Show updated successfully'));
});

// @desc    Delete/Cancel a show
// @route   DELETE /api/shows/:id
// @access  Admin
export const deleteShow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const show = await Show.findByIdAndUpdate(id, { showStatus: 'cancelled' }, { new: true });
  if (!show) throw new ApiError(404, `Show with ID ${id} not found`);
  return res.status(200).json(new ApiResponse(200, show, 'Show cancelled successfully'));
});
