import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true
    },
    language: {
      type: String,
      required: [true, 'Movie language is required'],
      trim: true,
      index: true
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Movie duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
      index: true
    },
    cast: {
      type: [String],
      default: []
    },
    director: {
      type: String,
      trim: true,
      default: ''
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required']
    },
    backdropUrl: {
      type: String,
      required: [true, 'Backdrop URL is required']
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    ageRating: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R'],
      default: 'UA'
    },
    averageRating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    movieStatus: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search across title, genre, and cast
// language_override: 'none' prevents MongoDB from treating the 'language' field as a text-stemming language
movieSchema.index(
  { title: 'text', genre: 'text', director: 'text' },
  { default_language: 'english', language_override: 'none' }
);

export const Movie = mongoose.model('Movie', movieSchema);
