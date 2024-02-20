import { Request, Response } from 'express';
import razorpayInstance from '../services/paymentGateway';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';

export const getPaymentInfo = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { paymentID = '' } = req.query || {};
    if (!paymentID) {
      throw new AdventourAppError('Payment ID not found', 404);
    }

    const payment: any = await razorpayInstance.payments.fetch(
      paymentID as string
    );

    if (payment?.error) {
      throw new AdventourAppError(
        payment?.error?.description || 'Something went wrong',
        404
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        payment,
      },
    });
  }
);
