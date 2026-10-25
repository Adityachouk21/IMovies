import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
      index: true
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Show start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'Show end time is required']
    },
    seatPricing: {
      Silver: { type: Number, required: true, default: 180 },
      Gold: { type: Number, required: true, default: 280 },
      Premium: { type: Number, required: true, default: 420 }
    },
    showStatus: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly query shows by movie and date range
showSchema.index({ movieId: 1, startTime: 1 });
// Screen scheduling conflict prevention index
showSchema.index({ screenId: 1, startTime: 1, endTime: 1 });

export const Show = mongoose.model('Show', showSchema);
