import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Bookings from '../models/bookingModel';
import AdventourAppError from '../utils/adventourAppError';
import { FilterQuery } from 'mongoose';

export const getAllBookingsInfo = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      sortBy = 'latest',
      status = 'confirmed',
      selectedDate = '',
    } = req.query || {};

    if (!status || (status != 'confirmed' && status != 'cancelled')) {
      throw new AdventourAppError('Invalid status', 400);
    } else if (!sortBy || (sortBy != 'latest' && sortBy != 'oldest')) {
      throw new AdventourAppError('Invalid sortBy', 400);
    } else if (Number(page) < 1) {
      throw new AdventourAppError('Invalid page', 400);
    }

    const filterCriteria: FilterQuery<any> = {
      status,
    };

    if (selectedDate) {
      filterCriteria['tourStartDate'] = {
        $eq: new Date(selectedDate as string),
      };
    }

    const limit = 3;
    const totalDocuments = await Bookings.countDocuments(filterCriteria);

    const totalPages = Math.ceil(totalDocuments / limit);

    const skip = (Number(page) - 1) * limit;
    const allBookings = await Bookings.find(filterCriteria)
      .populate({
        path: 'user',
        select: 'userName avatar email -_id',
      })
      .populate({
        path: 'tour',
        select: 'mainCoverImage title -_id',
      })
      .sort({
        createdAt: sortBy === 'oldest' ? 1 : -1,
      })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      status: 'success',
      data: {
        bookings: allBookings,
      },
      pagination: {
        totalPages,
        page: Number(page) > totalPages ? totalPages : Number(page),
      },
    });
  }
);
