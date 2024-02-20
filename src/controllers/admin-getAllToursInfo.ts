import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import ToursValidation from '../models/toursValidationModel';

export const getTourWithID = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params.id);
    const tour = await ToursValidation.findById(req.params.id);
    if (!tour) {
      throw new AdventourAppError('Tour not found', 404);
    }

    console.log(tour);
    res.status(200).json({
      status: 'success',
      totalResults: 1,
      data: {
        tour,
      },
    });
  }
);

export const getAllToursForAdmin = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      status,
      isAccepted,
      isRejected,
      page = 1,
      limit = 10,
    } = req.query || {};

    if (!status || (status != 'verified' && status != 'unverified')) {
      throw new AdventourAppError('Invalid status', 400);
    }

    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const totalResults = await ToursValidation.countDocuments({
      isVerified: status === 'verified',
    });

    const totalPages = Math.ceil(totalResults / (limit as number));

    const tourData = await ToursValidation.find(
      {
        isVerified: status === 'verified',
      },
      {
        mainCoverImage: 1,
        title: 1,
        submissionDate: 1,
        isVerified: 1,
        createdBy: 1,
        isRejected: 1,
        isAccepted: 1,
      }
    )
      .populate({
        path: 'createdBy',
        select: 'email _id  mainCoverImage',
      })
      .sort({ submissionDate: 1 })
      .skip(skip)
      .limit(parseInt(limit as string, 10));

    res.status(200).json({
      status: 'success',
      pagination: {
        page:
          parseInt(page as string, 10) > totalPages
            ? totalPages
            : parseInt(page as string, 10),
        totalPages,
      },
      totalResults: tourData.length,
      data: {
        tourData,
      },
    });
  }
);
