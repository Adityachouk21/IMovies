import mongoose from 'mongoose';
import { Theater } from '../models/Theater.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sampleTheaters } from '../utils/sampleData.js';

// @desc    Get all theaters with optional city filter and search
// @route   GET /api/theaters
// @access  Public
export const getTheaters = asyncHandler(async (req, res) => {
  const { city, search } = req.query;

  if (mongoose.connection.readyState !== 1) {
    let list = [...sampleTheaters];

    if (city) {
      list = list.filter((t) => t.city.toLowerCase() === city.toLowerCase());
    }

    if (search) {
      list = list.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    }

    return res.status(200).json(
      new ApiResponse(200, { count: list.length, theaters: list }, 'Theaters fetched successfully')
    );
  }

  const query = { isActive: true };

  if (city) {
    query.city = { $regex: new RegExp(`^${city}$`, 'i') };
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const theaters = await Theater.find(query)
    .populate('screens', 'name screenType totalSeats seatCategories')
    .sort({ name: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { count: theaters.length, theaters }, 'Theaters fetched successfully')
  );
});

// @desc    Get single theater by ID
// @route   GET /api/theaters/:id
// @access  Public
export const getTheaterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (mongoose.connection.readyState !== 1) {
    const theater = sampleTheaters.find((t) => t._id === id);
    if (!theater) throw new ApiError(404, `Theater with ID ${id} not found`);
    return res.status(200).json(new ApiResponse(200, theater, 'Theater details fetched successfully'));
  }

  const theater = await Theater.findById(id).populate('screens').lean();
  if (!theater) throw new ApiError(404, `Theater with ID ${id} not found`);

  return res.status(200).json(new ApiResponse(200, theater, 'Theater details fetched successfully'));
});

// @desc    Create a new theater
// @route   POST /api/theaters
// @access  Admin
export const createTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.create(req.body);
  return res.status(201).json(new ApiResponse(201, theater, 'Theater created successfully'));
});

// @desc    Update a theater
// @route   PUT /api/theaters/:id
// @access  Admin
export const updateTheater = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const theater = await Theater.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!theater) throw new ApiError(404, `Theater with ID ${id} not found`);
  return res.status(200).json(new ApiResponse(200, theater, 'Theater updated successfully'));
});

// @desc    Create a screen for a theater
// @route   POST /api/theaters/:theaterId/screens
// @access  Admin
export const createScreen = asyncHandler(async (req, res) => {
  const { theaterId } = req.params;
  const theater = await Theater.findById(theaterId);
  if (!theater) throw new ApiError(404, `Theater with ID ${theaterId} not found`);

  const rows = [
    { rowLabel: 'A', category: 'Silver', count: 10 },
    { rowLabel: 'B', category: 'Silver', count: 10 },
    { rowLabel: 'C', category: 'Gold', count: 12 },
    { rowLabel: 'D', category: 'Gold', count: 12 },
    { rowLabel: 'E', category: 'Gold', count: 12 },
    { rowLabel: 'F', category: 'Gold', count: 12 },
    { rowLabel: 'G', category: 'Premium', count: 8 },
    { rowLabel: 'H', category: 'Premium', count: 8 }
  ];

  const layoutRows = rows.map((r) => ({
    rowLabel: r.rowLabel,
    category: r.category,
    seats: Array.from({ length: r.count }, (_, i) => ({
      number: i + 1,
      isAisle: i === 2 || i === r.count - 3,
      isActive: true
    }))
  }));

  const totalSeats = rows.reduce((sum, r) => sum + r.count, 0);

  const screen = await Screen.create({
    theaterId,
    name: req.body.name || `Screen ${theater.screens.length + 1}`,
    screenType: req.body.screenType || 'IMAX 2D',
    seatCategories: req.body.seatCategories || [
      { name: 'Silver', basePrice: 180 },
      { name: 'Gold', basePrice: 280 },
      { name: 'Premium', basePrice: 420 }
    ],
    totalSeats,
    seatLayout: { rows: layoutRows }
  });

  const seatDocs = [];
  for (const r of rows) {
    for (let i = 1; i <= r.count; i++) {
      seatDocs.push({
        screenId: screen._id,
        rowLabel: r.rowLabel,
        seatNumber: i,
        category: r.category,
        activeStatus: true
      });
    }
  }
  await Seat.insertMany(seatDocs);

  theater.screens.push(screen._id);
  await theater.save();

  return res.status(201).json(new ApiResponse(201, screen, 'Screen created successfully'));
});
