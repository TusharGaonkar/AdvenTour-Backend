import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import Bookings from '../models/bookingModel';

const getUserBookings = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new AdventourAppError('User not found', 404);
    }

    const { type = 'upcoming', page = 1, limit = 4 } = req.query || {};
    const filter: FilterQuery<any> = {
      user: user._id,
      status: 'confirmed',
    };

    if (type === 'past') {
      filter['tourStartDate'] = {
        $lt: new Date(),
      };
    } else if (type === 'upcoming') {
      filter['tourStartDate'] = {
        $gte: new Date(),
      };
    }

    const totalBookings = await Bookings.countDocuments(filter);

    const totalPages = Math.ceil(totalBookings / Number(limit));
    const skip = (Number(page) - 1) * Number(limit);
    const getAllConfirmedBookings = await Bookings.find(filter)
      .populate({
        path: 'tour',
        select: 'title , mainCoverImage',
      })
      .select({
        expiresIn: 0,
        __v: 0,
        razorpay_order_id: 0,
        user: 0,
      })
      .sort('tourStartDate')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      totalBookings : totalBookings,
      data: {
        bookings: getAllConfirmedBookings,
      },
      pagination: {
        currentPage: Number(page),
        totalPages: totalPages,
      },
    });
  }
);

export default getUserBookings;
