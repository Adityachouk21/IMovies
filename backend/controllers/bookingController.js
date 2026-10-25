import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { releaseSeatLocks, markSeatsAsBooked, unmarkSeatsAsBooked } from '../services/seatLockService.js';
import { getSampleShows } from '../utils/sampleData.js';

// In-memory bookings store when MongoDB is not connected
const inMemoryBookings = new Map(); // key: bookingReference -> booking object

const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IMO-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Create and confirm a ticket booking
// @route   POST /api/bookings
// @access  Protected (Authenticated Customer)
export const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats, paymentMethod = 'card', promoCode = null, discount = 0 } = req.body;
  const userId = req.user._id;

  if (!showId) {
    throw new ApiError(400, 'Show ID is required for booking');
  }

  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(400, 'Please select at least one seat to book');
  }

  const isDBConnected = mongoose.connection.readyState === 1;

  // Calculate financials
  const subtotal = seats.reduce((acc, seat) => acc + (Number(seat.price) || 200), 0);
  const fees = seats.length * 30; // ₹30 convenience fee per ticket
  const taxes = Math.round((subtotal + fees) * 0.18); // 18% GST
  const grossTotal = subtotal + fees + taxes;
  const validatedDiscount = Math.min(Math.max(0, Number(discount) || 0), grossTotal);
  const totalAmount = Math.max(0, grossTotal - validatedDiscount);

  const bookingReference = generateBookingRef();
  const seatLabels = seats.map((s) => s.seatLabel || `${s.row}${s.seatNumber}`);

  let showData = null;

  if (!isDBConnected) {
    const fallbackShow = getSampleShows().find((s) => s._id === showId) || getSampleShows()[0];
    showData = fallbackShow;

    const booking = {
      _id: 'bk_' + Date.now(),
      bookingReference,
      userId,
      showId,
      show: fallbackShow,
      seats: seats.map((s) => ({
        row: s.row,
        seatNumber: s.seatNumber,
        seatLabel: s.seatLabel || `${s.row}${s.seatNumber}`,
        category: s.category || 'Gold',
        price: s.price || 200
      })),
      subtotal,
      taxes,
      fees,
      discount: validatedDiscount,
      promoCode,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentId: `PAY_TEST_${Date.now()}`,
      paymentMethod,
      qrCodeData: JSON.stringify({
        ref: bookingReference,
        movie: fallbackShow.movieId?.title || 'Blockbuster Movie',
        seats: seatLabels,
        time: fallbackShow.startTime,
        total: totalAmount,
        promoCode
      }),
      createdAt: new Date().toISOString()
    };

    inMemoryBookings.set(bookingReference, booking);
    markSeatsAsBooked(showId, seatLabels);

    // Broadcast real-time booking update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`show_${showId}`).emit('seats_booked', {
        showId,
        bookedSeats: seatLabels,
        bookedBy: userId
      });
    }

    return res.status(201).json(new ApiResponse(201, booking, 'Booking confirmed successfully'));
  }

  // MongoDB flow
  const show = await Show.findById(showId)
    .populate('movieId', 'title posterUrl duration ageRating language format')
    .populate('theaterId', 'name city address facilities')
    .populate('screenId', 'name screenType');

  if (!show) {
    throw new ApiError(404, 'Showtime not found');
  }

  // Check if any seat is already booked
  const conflictingBooking = await Booking.findOne({
    showId,
    bookingStatus: { $in: ['confirmed', 'pending'] },
    'seats.seatLabel': { $in: seatLabels }
  });

  if (conflictingBooking) {
    throw new ApiError(409, 'One or more of the selected seats are already booked. Please choose other seats.');
  }

  const qrData = JSON.stringify({
    ref: bookingReference,
    movie: show.movieId?.title,
    theater: show.theaterId?.name,
    seats: seatLabels,
    time: show.startTime,
    total: totalAmount,
    promoCode
  });

  const newBooking = await Booking.create({
    bookingReference,
    userId,
    showId,
    seats: seats.map((s) => ({
      row: s.row,
      seatNumber: s.seatNumber,
      seatLabel: s.seatLabel || `${s.row}${s.seatNumber}`,
      category: s.category || 'Gold',
      price: s.price
    })),
    subtotal,
    taxes,
    fees,
    discount: validatedDiscount,
    promoCode,
    totalAmount,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    paymentId: `PAY_${Date.now()}`,
    qrCodeData: qrData
  });

  // Release temporary locks
  await releaseSeatLocks(showId, seatLabels, userId);

  // Broadcast real-time update
  const io = req.app.get('io');
  if (io) {
    io.to(`show_${showId}`).emit('seats_booked', {
      showId,
      bookedSeats: seatLabels,
      bookedBy: userId
    });
  }

  const populatedBooking = await Booking.findById(newBooking._id)
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration ageRating language format' },
        { path: 'theaterId', select: 'name city address facilities' },
        { path: 'screenId', select: 'name screenType' }
      ]
    });

  return res.status(201).json(new ApiResponse(201, populatedBooking, 'Booking confirmed successfully'));
});

// @desc    Get current user's bookings history
// @route   GET /api/bookings/my
// @access  Protected (Authenticated Customer)
export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    const list = Array.from(inMemoryBookings.values())
      .filter((b) => String(b.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(new ApiResponse(200, list, 'User bookings retrieved successfully'));
  }

  const bookings = await Booking.find({ userId })
    .populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration ageRating language format genre' },
        { path: 'theaterId', select: 'name city address facilities' },
        { path: 'screenId', select: 'name screenType' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, bookings, 'User bookings retrieved successfully'));
});

// @desc    Get single booking by reference or ID
// @route   GET /api/bookings/:id
// @access  Protected
export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    let booking = inMemoryBookings.get(id);
    if (!booking) {
      booking = Array.from(inMemoryBookings.values()).find((b) => b._id === id);
    }
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    if (!isAdmin && String(booking.userId) !== String(userId)) {
      throw new ApiError(403, 'Unauthorized to view this booking pass');
    }
    return res.status(200).json(new ApiResponse(200, booking, 'Booking details retrieved'));
  }

  let booking = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    booking = await Booking.findById(id).populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration ageRating language format genre' },
        { path: 'theaterId', select: 'name city address facilities' },
        { path: 'screenId', select: 'name screenType' }
      ]
    });
  } else {
    booking = await Booking.findOne({ bookingReference: id.toUpperCase() }).populate({
      path: 'showId',
      populate: [
        { path: 'movieId', select: 'title posterUrl duration ageRating language format genre' },
        { path: 'theaterId', select: 'name city address facilities' },
        { path: 'screenId', select: 'name screenType' }
      ]
    });
  }

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (!isAdmin && String(booking.userId) !== String(userId)) {
    throw new ApiError(403, 'Unauthorized to view this booking pass');
  }

  return res.status(200).json(new ApiResponse(200, booking, 'Booking details retrieved'));
});

// @desc    Cancel a booking
// @route   POST /api/bookings/:id/cancel
// @access  Protected
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    let booking = inMemoryBookings.get(id) || Array.from(inMemoryBookings.values()).find((b) => b._id === id);
    if (!booking) throw new ApiError(404, 'Booking not found');
    if (!isAdmin && String(booking.userId) !== String(userId)) {
      throw new ApiError(403, 'Not authorized to cancel this ticket');
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationStatus = {
      isCancelled: true,
      cancelledAt: new Date(),
      refundAmount: booking.subtotal // refunded minus convenience fee
    };

    const seatLabels = booking.seats.map((s) => s.seatLabel);
    unmarkSeatsAsBooked(booking.showId, seatLabels);

    const io = req.app.get('io');
    if (io) {
      io.to(`show_${booking.showId}`).emit('seats_released', {
        showId: booking.showId,
        seats: seatLabels,
        releasedBy: userId
      });
    }

    return res.status(200).json(new ApiResponse(200, booking, 'Ticket booking cancelled successfully. Refund initiated.'));
  }

  const booking = await Booking.findById(id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!isAdmin && String(booking.userId) !== String(userId)) {
    throw new ApiError(403, 'Not authorized to cancel this ticket');
  }

  if (booking.bookingStatus === 'cancelled') {
    throw new ApiError(400, 'This booking has already been cancelled');
  }

  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  booking.cancellationStatus = {
    isCancelled: true,
    cancelledAt: new Date(),
    refundAmount: booking.subtotal
  };
  await booking.save();

  const seatLabels = booking.seats.map((s) => s.seatLabel);
  const io = req.app.get('io');
  if (io) {
    io.to(`show_${booking.showId}`).emit('seats_released', {
      showId: booking.showId,
      seats: seatLabels,
      releasedBy: userId
    });
  }

  return res.status(200).json(new ApiResponse(200, booking, 'Ticket booking cancelled successfully. Refund initiated.'));
});
