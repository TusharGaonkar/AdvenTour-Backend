import mongoose, { InferSchemaType } from 'mongoose';

const paymentSchema = new mongoose.Schema({
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: false,
    default: new Date(),
  },
});

const Payments = mongoose.model<InferSchemaType<typeof paymentSchema>>(
  'Payments',
  paymentSchema
);

export default Payments;
