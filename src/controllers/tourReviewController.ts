import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel';
import TourReviews from '../models/tourReviewsModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Users from '../models/userModel';
import { HydratedDocument } from 'mongoose';

export const createTourReview = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { _id: userID } = req.user as HydratedDocument<any>;

    if (!userID) throw new AdventourAppError('Please login first!', 401);

    const { tourID } = req.params;

    const tour = await Tour.exists({ _id: tourID });
    if (!tour) throw new AdventourAppError('Invalid tour ID!', 404);

    const { title, description, rating, travelGroup, images } = req.body;

    if (!title || !description || !rating || !travelGroup)
      throw new AdventourAppError(
        'Please provide title, description, rating, travelGroup in the request!',
        400
      );

    const tourReview = await TourReviews.create({
      tour: tourID,
      user: userID,
      title,
      description,
      rating,
      travelGroup,
      images,
    });

    res.status(200).json({
      status: 'success',
      totalResults: 1,
      data: {
        tourReview,
      },
    });
  }
);

export const getTourReviews = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { tourID } = req.params;
    const tourReviews = await TourReviews.find({ tour: tourID })
      .populate({
        path: 'user',
        select: 'userName avatar -_id',
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      status: 'success',
      totalResults: tourReviews.length,
      data: {
        tourReviews,
      },
    });
  }
);
