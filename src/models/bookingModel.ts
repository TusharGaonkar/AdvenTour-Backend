import mongoose, { InferSchemaType } from 'mongoose';
import validation from 'validator';

const STATUS = ['pending', 'confirmed', 'failed'];

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
    required: true,
  },

  tourStartDate: {
    type: Date,
    required: true,
  },

  tourDurationInDays: {
    type: Number,
    required: true,
  },

  expiresIn: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: STATUS,
    default: 'pending',
  },

  bookingFor: {
    type: Number,
    required: true,
  },

  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: false,
  },
  totalCost: {
    type: Number,
    required: true,
  },
});

// Index commonly queried fields in the booking controller to speed up queries
bookingSchema.index({
  tour: 1,
  user: 1,
  tourStartDate: 1,
  bookingFor: 1,
  status: 1,
  expiresIn: 1,
});

const Bookings = mongoose.model<InferSchemaType<typeof bookingSchema>>(
  'Bookings',
  bookingSchema
);

export default Bookings;
