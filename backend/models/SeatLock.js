import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
      index: true
    },
    seatNumber: {
      type: String, // e.g. "A1", "C12"
      required: [true, 'Seat identifier is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    reservationToken: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index to assist background cleanup
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active locks for the same show and seat
seatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

export const SeatLock = mongoose.model('SeatLock', seatLockSchema);
