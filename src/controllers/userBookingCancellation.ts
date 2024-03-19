import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import Bookings from '../models/bookingModel';

const userBookingCancellation = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    const user = req.user;
    if (!user) throw new AdventourAppError('User not found', 401);

    const { bookingID = '' } = req.body || {};

    if (!bookingID || typeof bookingID !== 'string')
      throw new AdventourAppError('Please provide a booking ID', 404);

    //First find the booking only cancellable if the tour date is after 7 days or more
    const cancellationWindow = 7;
    const todayDate = new Date().getDate();
    const sevenDaysFromToday = new Date().setDate(
      todayDate + cancellationWindow
    );

    const booking = await Bookings.findOne({
      _id: bookingID,
      user: user._id,
      status: 'confirmed',
      tourStartDate: {
        $gte: sevenDaysFromToday,
      },
    });

    if (!booking)
      throw new AdventourAppError(
        'Unfortunately your booking cancellation window has ended for this tour',
        404
      );

    // update the status of the booking , refund will be processed manually by the admin later
    const updatedBooking = await Bookings.findOneAndUpdate(
      {
        _id: bookingID,
        user: user._id,
        status: 'confirmed',
        tourStartDate: {
          $gte: sevenDaysFromToday,
        },
      },
      {
        status: 'cancelled',
        isRefunded: false,
      }
    );

    if (!updatedBooking)
      throw new AdventourAppError(
        'Something went wrong while cancelling the booking , please try again',
        500
      );

    res.status(200).json({
      status: 'success',
      message: 'Your booking has been cancelled successfully',
    });
  }
);

export default userBookingCancellation;
