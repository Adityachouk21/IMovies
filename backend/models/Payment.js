import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'test'],
      default: 'razorpay'
    },
    providerOrderId: {
      type: String,
      required: true,
      index: true
    },
    providerPaymentId: {
      type: String,
      default: null,
      index: true
    },
    providerSignature: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'captured', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    idempotencyKey: {
      type: String,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
