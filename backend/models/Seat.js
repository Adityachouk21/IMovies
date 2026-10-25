import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
      index: true
    },
    rowLabel: {
      type: String,
      required: [true, 'Row label is required'],
      uppercase: true
    },
    seatNumber: {
      type: Number,
      required: [true, 'Seat number is required']
    },
    category: {
      type: String,
      enum: ['Silver', 'Gold', 'Premium'],
      required: [true, 'Category is required']
    },
    activeStatus: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure uniqueness of physical seat per screen
seatSchema.index({ screenId: 1, rowLabel: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.model('Seat', seatSchema);
