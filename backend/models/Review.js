import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
);

// Enforce one review per user per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
