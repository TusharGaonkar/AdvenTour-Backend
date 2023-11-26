import mongoose, { InferSchemaType } from 'mongoose';
import validation from 'validator';

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Tours',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Users',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },

  tourStartDate: {
    type: Date,
    required: true,
  },

  tourEndDate: {
    type: Date,
    required: true,
  },

  bookingAmountInRupees: {
    type: Number,
    required: true,
    min: [100, 'Booking cost must be greater than 100'],
  },

  discountInRupees: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Discount must be greater than 0'],
  },

  isPaid: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const Bookings = mongoose.model<InferSchemaType<typeof bookingSchema>>(
  'Bookings',
  bookingSchema
);

export default Bookings;
