import { FilterQuery } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Bookings from '../models/bookingModel';
import AdventourAppError from '../utils/adventourAppError';
import Tour from '../models/tourModel';

export const getGuideBookingsInfo = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || user.role !== 'local-guide') {
      throw new AdventourAppError('Local guide not found', 401);
    }

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

    // Get all the tours that the guide contributed

    const allRegisteredTours = await Tour.find({
      createdBy: user._id,
    }).select('_id');

    if (!allRegisteredTours || allRegisteredTours.length === 0) {
      throw new AdventourAppError('No Registered tours', 404);
    }

    const registeredToursList = allRegisteredTours.map((tour) => tour._id);

    const filterCriteria: FilterQuery<any> = {
      status,
      tour: {
        $in: registeredToursList,
      },
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
      .select(
        'user tour tourStartDate bookingFor createdAt tourDurationInDays status totalCost _id'
      )
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
