import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Theater address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food Court', 'Parking']
    },
    contactPhone: {
      type: String,
      trim: true,
      default: ''
    },
    screens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

theaterSchema.index({ name: 'text', address: 'text' });

export const Theater = mongoose.model('Theater', theaterSchema);
