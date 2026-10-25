import mongoose from 'mongoose';

const seatCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Silver', 'Gold', 'Premium']
    },
    basePrice: {
      type: Number,
      required: true,
      min: [50, 'Base price must be at least 50']
    }
  },
  { _id: false }
);

const seatItemSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    isAisle: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const seatRowSchema = new mongoose.Schema(
  {
    rowLabel: { type: String, required: true, uppercase: true },
    category: { type: String, required: true, enum: ['Silver', 'Gold', 'Premium'] },
    seats: [seatItemSchema]
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Screen must belong to a Theater'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true
    },
    screenType: {
      type: String,
      enum: ['IMAX 2D', 'IMAX 3D', '4DX', 'Standard 2D', 'Standard 3D', 'Dolby Cinema'],
      default: 'Standard 2D'
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1'
    },
    seatCategories: {
      type: [seatCategorySchema],
      default: [
        { name: 'Silver', basePrice: 180 },
        { name: 'Gold', basePrice: 280 },
        { name: 'Premium', basePrice: 420 }
      ]
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 80
    },
    seatLayout: {
      rows: [seatRowSchema]
    }
  },
  {
    timestamps: true
  }
);

export const Screen = mongoose.model('Screen', screenSchema);
