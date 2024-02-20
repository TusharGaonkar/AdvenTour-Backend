import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Bookings from '../models/bookingModel';
import Users from '../models/userModel';

export const getTourStats = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const totalSalesAndUpcomingBookings = Bookings.aggregate([
      {
        $match: {
          status: 'confirmed',
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: '$totalCost',
          },
          upcomingBookings: {
            $sum: {
              $cond: [{ $gte: ['$tourStartDate', new Date()] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalVerifiedGuidesQuery = Users.countDocuments({
      role: 'local-guide',
    });
    const [salesAndBookingsData, totalVerifiedGuides]: any = await Promise.all([
      totalSalesAndUpcomingBookings,
      totalVerifiedGuidesQuery,
    ]);

    const { totalSales = 0, upcomingBookings = 0 } =
      salesAndBookingsData?.[0] || {};
    res.status(200).json({
      status: 'success',
      data: {
        totalSales: totalSales,
        upcomingBookings,
        totalVerifiedGuides,
      },
    });
  }
);
