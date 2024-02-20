import mongoose, { InferSchemaType } from 'mongoose';
import { tourSchema } from './tourModel';

const toursValidationSchema = new mongoose.Schema({
  ...tourSchema.obj,
  submissionDate: {
    type: Date,
    default: Date.now,
    required: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },

  isAccepted: {
    type: Boolean,
    default: false,
  },

  adminName: {
    type: String,
    required: function () {
      return this.isVerified === true;
    },
    trim: true,
    minLength: [2, 'Admin name must not be empty'],
    maxLength: [50, 'Admin name must not exceed 50 characters'],
  },

  tourRemarks: {
    type: String,
    required: function () {
      return this.isVerified === true && this.isRejected === true;
    },
    trim: true,
    minLength: [10, 'Tour remarks must not be empty'],
    maxLength: [500, 'Tour remarks must not exceed 300 characters'],
  },
});

const ToursValidation = mongoose.model<
  InferSchemaType<typeof toursValidationSchema>
>('ToursValidation', toursValidationSchema);

export default ToursValidation;
