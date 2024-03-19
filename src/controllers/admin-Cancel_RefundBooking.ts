import Bookings from '../models/bookingModel';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import razorpayInstance from '../services/paymentGateway';
import { startSession } from 'mongoose';
import { Request, Response } from 'express';

export const cancelAndRefundBooking = apiClientErrorHandler(
  async (req: Request | any, res: Response) => {
    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const { bookingID = '' } = req.body || {};
        if (!bookingID) {
          throw new AdventourAppError('Please provide a booking ID', 404);
        }

        const booking = await Bookings.findOneAndUpdate(
          { _id: bookingID, status: 'confirmed', isRefunded: false },
          {
            status: 'cancelled',
            isRefunded: true,
          }
        ).session(session);

        if (!booking) {
          throw new AdventourAppError('Booking not found', 404);
        }

        const refundStatus: any = await razorpayInstance.payments.refund(
          booking?.razorpay_payment_id,
          {}
        ); // full refund with default props
        if (!refundStatus || refundStatus?.error) {
          throw new AdventourAppError(
            'Something went wrong while processing the refund request..',
            500
          );
        }

        res.status(200).json({
          status: 'success',
          data: {
            bookingID,
            refundStatus,
          },
        });
      });
    } catch (error) {
      throw new AdventourAppError(
        error.message || error.error.description || 'Internal server error',
        (error.statusCode || error.description) ?? 500
      );
    } finally {
      session.endSession();
    }
  }
);
