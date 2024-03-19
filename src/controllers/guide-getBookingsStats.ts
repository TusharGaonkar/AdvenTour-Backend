import { Request, Response } from 'express';
import mongoose from 'mongoose';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Tour from '../models/tourModel';
import AdventourAppError from '../utils/adventourAppError';
import Bookings from '../models/bookingModel';

const getBookingsStatsForGuide = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    const user = req.user;
    if (!user || user.role !== 'local-guide') {
      throw new AdventourAppError('Local guide not found', 401);
    }

    // First get all the tours contributed by the guide
    const allRegisteredTours = await Tour.find({
      createdBy: user._id,
    });

    if (!allRegisteredTours || allRegisteredTours.length === 0) {
      throw new AdventourAppError('No Registered tours', 404);
    }

    const pastTours = await Bookings.countDocuments({
      tour: {
        $in: allRegisteredTours,
      },
      tourStartDate: {
        $lt: new Date(),
      },
      status: 'confirmed',
    });

    const upcomingTours = await Bookings.countDocuments({
      tour: {
        $in: allRegisteredTours,
      },
      tourStartDate: {
        $gt: new Date(),
      },
      status: 'confirmed',
    });

    const salesAggregate = await Bookings.aggregate([
      {
        $match: {
          tour: {
            $in: allRegisteredTours.map(
              (tour) => new mongoose.Types.ObjectId(tour._id)
            ),
          },
          status: 'confirmed',
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: '$totalCost',
          },
        },
      },

      {
        $project: {
          _id: 0,
          totalSales: 1,
        },
      },
    ]);

    const totalSales =
      salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    res.status(200).json({
      status: 'success',
      data: {
        pastTours,
        upcomingTours,
        totalSales,
      },
    });
  }
);

export default getBookingsStatsForGuide;
