import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    seatLabel: { type: String, required: true }, // e.g. "A1"
    category: { type: String, required: true, enum: ['Silver', 'Gold', 'Premium'] },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true
    },
    seats: {
      type: [bookedSeatSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'At least one seat must be selected']
    },
    subtotal: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      required: true,
      default: 0
    },
    fees: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    promoCode: {
      type: String,
      default: null,
      uppercase: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired', 'refund_pending', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentId: {
      type: String,
      default: null
    },
    qrCodeData: {
      type: String,
      default: null
    },
    cancellationStatus: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date, default: null },
      refundAmount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
