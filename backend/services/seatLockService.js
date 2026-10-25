import mongoose from 'mongoose';
import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Booking } from '../models/Booking.js';
import { SeatLock } from '../models/SeatLock.js';
import { ApiError } from '../utils/ApiError.js';
import { sampleTheaters, getSampleShows } from '../utils/sampleData.js';

const LOCK_DURATION_MINUTES = 8;

// In-memory locks & bookings fallback for development when MongoDB is offline
const inMemoryLocks = new Map(); // key: `${showId}_${seatNumber}` -> { userId, expiresAt }
const inMemoryBookedSeats = new Map(); // key: showId -> Set of seatNumbers

export const getShowSeatMap = async (showId, currentUserId = null) => {
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    const show = getSampleShows().find((s) => s._id === showId) || getSampleShows()[0];
    const screen = show.screenId || sampleTheaters[0].screens[0];

    // Standard layout
    const rows = [
      { rowLabel: 'H', category: 'Premium', count: 8 },
      { rowLabel: 'G', category: 'Premium', count: 8 },
      { rowLabel: 'F', category: 'Gold', count: 12 },
      { rowLabel: 'E', category: 'Gold', count: 12 },
      { rowLabel: 'D', category: 'Gold', count: 12 },
      { rowLabel: 'C', category: 'Gold', count: 12 },
      { rowLabel: 'B', category: 'Silver', count: 10 },
      { rowLabel: 'A', category: 'Silver', count: 10 }
    ];

    const seatPricing = show.seatPricing || { Silver: 190, Gold: 290, Premium: 450 };

    // Get in-memory booked seats
    if (!inMemoryBookedSeats.has(showId)) {
      // Pre-seed a couple booked seats for realistic cinema feel
      inMemoryBookedSeats.set(showId, new Set(['E5', 'E6', 'F7', 'F8']));
    }
    const bookedSet = inMemoryBookedSeats.get(showId);

    // Active in-memory locks
    const now = Date.now();
    const activeLocks = [];
    for (const [key, lock] of inMemoryLocks.entries()) {
      if (key.startsWith(`${showId}_`)) {
        if (lock.expiresAt > now) {
          const seatNum = key.replace(`${showId}_`, '');
          activeLocks.push({
            seatNumber: seatNum,
            isCurrentUsers: currentUserId && String(lock.userId) === String(currentUserId),
            expiresAt: lock.expiresAt
          });
        } else {
          inMemoryLocks.delete(key);
        }
      }
    }

    return {
      showId,
      show,
      seatPricing,
      rows,
      bookedSeats: Array.from(bookedSet),
      lockedSeats: activeLocks
    };
  }

  // Live MongoDB querying
  const show = await Show.findById(showId)
    .populate('movieId', 'title posterUrl duration ageRating language')
    .populate('theaterId', 'name city address facilities')
    .populate('screenId')
    .lean();

  if (!show) {
    throw new ApiError(404, `Show with ID ${showId} not found`);
  }

  const screen = show.screenId;
  const rows = screen.seatLayout?.rows || [
    { rowLabel: 'H', category: 'Premium', count: 8 },
    { rowLabel: 'G', category: 'Premium', count: 8 },
    { rowLabel: 'F', category: 'Gold', count: 12 },
    { rowLabel: 'E', category: 'Gold', count: 12 },
    { rowLabel: 'D', category: 'Gold', count: 12 },
    { rowLabel: 'C', category: 'Gold', count: 12 },
    { rowLabel: 'B', category: 'Silver', count: 10 },
    { rowLabel: 'A', category: 'Silver', count: 10 }
  ];

  // 1. Find all permanently booked seats for this show
  const confirmedBookings = await Booking.find({
    showId,
    bookingStatus: { $in: ['confirmed', 'pending'] }
  }).lean();

  const bookedSeats = [];
  confirmedBookings.forEach((b) => {
    b.seats.forEach((s) => {
      bookedSeats.push(s.seatLabel || `${s.row}${s.seatNumber}`);
    });
  });

  // 2. Find active temporary locks for this show
  const now = new Date();
  const locks = await SeatLock.find({
    showId,
    expiresAt: { $gt: now }
  }).lean();

  const lockedSeats = locks.map((l) => ({
    seatNumber: l.seatNumber,
    isCurrentUsers: currentUserId && String(l.userId) === String(currentUserId),
    expiresAt: l.expiresAt
  }));

  return {
    showId,
    show,
    seatPricing: show.seatPricing,
    rows,
    bookedSeats,
    lockedSeats
  };
};

export const acquireSeatLocks = async (showId, seats, userId) => {
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(400, 'Please select at least one seat to reserve.');
  }

  if (seats.length > 10) {
    throw new ApiError(400, 'You cannot reserve more than 10 seats in a single booking.');
  }

  const isDBConnected = mongoose.connection.readyState === 1;
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);

  if (!isDBConnected) {
    const bookedSet = inMemoryBookedSeats.get(showId) || new Set();

    // Concurrency collision check
    for (const seat of seats) {
      if (bookedSet.has(seat)) {
        throw new ApiError(409, `Seat ${seat} is already booked for this show.`);
      }

      const lockKey = `${showId}_${seat}`;
      const existingLock = inMemoryLocks.get(lockKey);
      if (existingLock && existingLock.expiresAt > Date.now()) {
        if (String(existingLock.userId) !== String(userId)) {
          throw new ApiError(409, `Seat ${seat} is currently held by another user. Please choose another seat.`);
        }
      }
    }

    // Acquire all locks atomically
    seats.forEach((seat) => {
      inMemoryLocks.set(`${showId}_${seat}`, {
        userId,
        expiresAt: expiresAt.getTime()
      });
    });

    return {
      success: true,
      seats,
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: LOCK_DURATION_MINUTES * 60
    };
  }

  // Live MongoDB Concurrency Lock Acquisition
  const now = new Date();

  // 1. Verify show exists
  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, 'Show not found.');

  // 2. Verify seats are not booked
  const existingBooking = await Booking.findOne({
    showId,
    bookingStatus: { $in: ['confirmed', 'pending'] },
    'seats.seatLabel': { $in: seats }
  });

  if (existingBooking) {
    throw new ApiError(409, 'One or more selected seats have already been booked.');
  }

  // 3. Verify no active locks held by others
  const conflictingLock = await SeatLock.findOne({
    showId,
    seatNumber: { $in: seats },
    userId: { $ne: userId },
    expiresAt: { $gt: now }
  });

  if (conflictingLock) {
    throw new ApiError(
      409,
      `Seat ${conflictingLock.seatNumber} is currently held by another customer. Please select another seat.`
    );
  }

  // 4. Upsert/Acquire locks for current user
  const lockOps = seats.map((seatNumber) => ({
    updateOne: {
      filter: { showId, seatNumber },
      update: {
        $set: {
          showId,
          seatNumber,
          userId,
          expiresAt
        }
      },
      upsert: true
    }
  }));

  await SeatLock.bulkWrite(lockOps);

  return {
    success: true,
    seats,
    expiresAt: expiresAt.toISOString(),
    expiresInSeconds: LOCK_DURATION_MINUTES * 60
  };
};

export const releaseSeatLocks = async (showId, seats, userId) => {
  const isDBConnected = mongoose.connection.readyState === 1;

  if (!isDBConnected) {
    if (seats && Array.isArray(seats)) {
      seats.forEach((s) => {
        const key = `${showId}_${s}`;
        const lock = inMemoryLocks.get(key);
        if (lock && String(lock.userId) === String(userId)) {
          inMemoryLocks.delete(key);
        }
      });
    } else {
      // Release all locks of this user for this show
      for (const [key, lock] of inMemoryLocks.entries()) {
        if (key.startsWith(`${showId}_`) && String(lock.userId) === String(userId)) {
          inMemoryLocks.delete(key);
        }
      }
    }
    return { success: true };
  }

  const query = { showId, userId };
  if (seats && Array.isArray(seats) && seats.length > 0) {
    query.seatNumber = { $in: seats };
  }

  await SeatLock.deleteMany(query);
  return { success: true };
};

export const markSeatsAsBooked = (showId, seatNumbers) => {
  if (!inMemoryBookedSeats.has(showId)) {
    inMemoryBookedSeats.set(showId, new Set(['E5', 'E6', 'F7', 'F8']));
  }
  const bookedSet = inMemoryBookedSeats.get(showId);
  seatNumbers.forEach((seat) => {
    bookedSet.add(seat);
    // Remove active lock if any
    inMemoryLocks.delete(`${showId}_${seat}`);
  });
};

export const unmarkSeatsAsBooked = (showId, seatNumbers) => {
  if (inMemoryBookedSeats.has(showId)) {
    const bookedSet = inMemoryBookedSeats.get(showId);
    seatNumbers.forEach((seat) => {
      bookedSet.delete(seat);
    });
  }
};

