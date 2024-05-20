import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import razorpayInstance from '../services/paymentGateway';
import Bookings from '../models/bookingModel';
import Tour from '../models/tourModel';
import { startSession } from 'mongoose';
import crypto from 'crypto';
import Payments from '../models/paymentModel';

const BOOKING_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes

export const getGatewaykeyID = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const keyID = process.env.RAZORPAY_KEY_ID;
    if (!keyID)
      throw new AdventourAppError(
        'Something went wrong while getting gateway key id',
        500
      );
    res.status(200).json({
      status: 'success',
      data: {
        keyID: process.env.RAZORPAY_KEY_ID,
      },
    });
  }
);

const checkExistingOrder = async (
  tourID: string,
  userID: string,
  startDate: string,
  peopleCount: number
) => {
  if (!tourID || !userID || !startDate || !peopleCount) {
    throw new AdventourAppError(
      'Something went wrong while checking for existing booking',
      400
    );
  }

  // check for existing order for this tour and user with the given config if yes return that if it's not expired
  const existingOrder = await Bookings.findOne({
    tour: tourID,
    user: userID,
    tourStartDate: new Date(startDate),
    bookingFor: peopleCount,
    status: 'pending',
    expiresIn: {
      $gt: new Date().getTime(),
    },
  });

  if (existingOrder) {
    return {
      orderID: existingOrder.razorpay_order_id,
      bookingID: existingOrder._id,
      expiresIn: existingOrder.expiresIn,
    };
  }

  return null;
};

const checkValidTour = async (
  tourID: string,
  startDate: string,
  peopleCount: number
) => {
  if (!tourID || !startDate || !peopleCount) {
    throw new AdventourAppError(
      'Something went wrong while checking for slots availability',
      400
    );
  }

  const tour = await Tour.findById(tourID).select(
    'tourStartDates maxPeoplePerBooking  tourMaxCapacity tourDurationInDays'
  );

  if (!tour) {
    throw new AdventourAppError('Tour not found', 404);
  }

  const isValidDate = tour?.tourStartDates.some(
    (date: Date) => new Date(startDate).toDateString() === date.toDateString()
  );

  const isValidCount = (tour?.maxPeoplePerBooking as number) >= peopleCount;

  if (!isValidCount || !isValidDate) {
    throw new AdventourAppError(
      'Max people per booking exceeded or start date not available for booking',
      400
    );
  }

  return tour;
};

// Handle potential race condition while multiple people book the same tour concurrently so making it atomic using transactions!
export const createNewOrder = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        if (!req.user || !(req.user as any)._id) {
          throw new AdventourAppError('Please login first', 401);
        }

        const userID = (req.user as any)?._id;
        const { tourID, startDate, peopleCount, totalCost } = req.body;

        if (!tourID || !userID || !startDate || !peopleCount || !totalCost) {
          throw new AdventourAppError(
            'Please provide tour id, user id, tour start date, tour duration in days , number of people and total amount',
            400
          );
        }

        const existingOrderID = await checkExistingOrder(
          tourID,
          userID,
          startDate,
          peopleCount
        );

        if (existingOrderID) {
          return res.status(200).json({
            status: 'success',
            data: {
              ...existingOrderID,
            },
          });
        }

        //  create new order with razorpay
        const [razorpayOrder, tour] = await Promise.all([
          razorpayInstance.orders.create({
            amount: totalCost * 100,
            currency: 'INR',
          }),

          checkValidTour(tourID, startDate, peopleCount),
        ]);

        if (!razorpayOrder || (razorpayOrder as any)?.error) {
          throw new AdventourAppError(
            'Something went wrong while creating order',
            500
          );
        }

        // check if slots are available or not
        const totalSlotsBooked = await Bookings.aggregate([
          {
            $match: {
              tour: tourID,
              tourStartDate: new Date(startDate),
              status: {
                $in: ['confirmed', 'pending'],
              },
              expiresIn: {
                $gt: new Date().getTime(),
              },
            },
          },
          {
            $group: {
              _id: null,
              bookingCount: { $sum: '$bookingFor' },
            },
          },
        ]).session(session);

        if (
          totalSlotsBooked.length > 0 &&
          totalSlotsBooked[0].bookingCount + peopleCount > tour?.tourMaxCapacity
        ) {
          throw new AdventourAppError(
            'Unfortunately all slots are booked, please try after 10 mins..',
            400
          );
        }

        const newBooking: any = await Bookings.create(
          [
            {
              tour: tourID,
              user: userID,
              tourStartDate: new Date(startDate),
              tourDurationInDays: tour?.tourDurationInDays,
              bookingFor: peopleCount,
              razorpay_order_id: razorpayOrder.id,
              expiresIn: Date.now() + BOOKING_EXPIRATION_TIME,
              totalCost,
              createdAt: new Date(),
            },
          ],
          { session }
        );

        if (!newBooking || newBooking.length === 0) {
          throw new AdventourAppError(
            'Something went wrong while creating new booking',
            500
          );
        }

        res.status(200).json({
          status: 'success',
          data: {
            orderID: razorpayOrder.id,
            bookingID: newBooking[0]._id,
            expiresIn: newBooking[0].expiresIn,
          },
        });
      });
    } catch (error) {
      throw new AdventourAppError(
        error.message || 'Internal server error',
        error.statusCode ?? 500
      );
    } finally {
      session.endSession();
    }
  }
);

export const paymentVerification = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    if (
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      throw new AdventourAppError('Invalid payload', 400);
    } else if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      throw new AdventourAppError('Invalid payload', 400);
    }

    const payload = razorpay_order_id + '|' + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
      .update(payload.toString())
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new AdventourAppError('Invalid signature', 400);
    }

    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const newPayment = await Payments.create(
          [
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            },
          ],
          { session }
        );

        if (!newPayment || newPayment.length === 0) {
          throw new AdventourAppError(
            'Something went wrong while creating payment',
            500
          );
        }

        const updatedBookingStatus = await Bookings.findOneAndUpdate(
          {
            razorpay_order_id,
            status: 'pending',
          },
          { status: 'confirmed', razorpay_payment_id: razorpay_payment_id },
          { session, new: true }
        );

        if (!updatedBookingStatus) {
          throw new AdventourAppError(
            'Something went wrong while updating booking status',
            500
          );
        }
      });

      res.redirect(`${process.env.FRONTEND_BASE_URL}/bookings`);
    } catch (error) {
      throw new AdventourAppError(
        error.message || 'Internal server error',
        error.statusCode ?? 500
      );
    } finally {
      session.endSession();
    }
  }
);
