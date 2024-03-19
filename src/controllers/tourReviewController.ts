import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/tourModel';
import TourReviews from '../models/tourReviewsModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import { HydratedDocument, PipelineStage } from 'mongoose';
import uploadImageToCloudinary from '../services/cloudinaryImageUpload';

export const createTourReview = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { _id: userID } = req.user as HydratedDocument<any>;

    if (!userID) throw new AdventourAppError('Please login first!', 401);

    const { tourID } = req.params;

    const tour = await Tour.exists({ _id: tourID });
    if (!tour) throw new AdventourAppError('Invalid tour ID!', 404);

    const { title, description, rating, travelGroup } = req.body;

    if (!title || !description || !rating || !travelGroup)
      throw new AdventourAppError(
        'Please provide title, description, rating, travelGroup in the request!',
        400
      );

    if (rating < 1 || rating > 5) {
      throw new AdventourAppError('Rating must be between 1 and 5!', 400);
    }

    const totalReviewImages = req.files?.length as number;

    var reviewImages = undefined;

    const alreadyReviewed = await TourReviews.exists({
      tour: tourID,
      user: userID,
    });

    if (alreadyReviewed)
      throw new AdventourAppError('You have already reviewed this tour!', 400);

    if (totalReviewImages > 0 && totalReviewImages <= 2) {
      reviewImages = req.files;

      const uploadedReviewImages = (reviewImages as Express.Multer.File[])?.map(
        (image) => uploadImageToCloudinary(image.path, 'tour-review-images')
      );

      reviewImages = await Promise.all(uploadedReviewImages);
    }

    const tourReview = await TourReviews.create({
      tour: tourID,
      user: userID,
      createdAt: new Date(),
      title,
      description,
      rating,
      travelGroup,
      reviewImages,
    });

    if (!tourReview)
      throw new AdventourAppError(
        'Something went wrong while creating review!',
        500
      );

    res.status(200).json({
      status: 'success',
      totalResults: 1,
      data: {
        tour: 'success',
      },
    });
  }
);

export const getTourRatingDistribution = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { tourID } = req.params;
    if (!tourID) throw new AdventourAppError('Invalid tour ID!', 404);

    const ratingDistributionPipeline: PipelineStage[] = [
      {
        $facet: {
          ratingsDistribution: [
            {
              $match: {
                tour: new mongoose.Types.ObjectId(tourID),
              },
            },
            {
              $group: {
                _id: { rated: '$rating' },
                count: { $sum: 1 },
              },
            },

            {
              $sort: {
                createdAt: -1,
              },
            },
          ],
          averageRating: [
            {
              $match: {
                tour: new mongoose.Types.ObjectId(tourID),
              },
            },
            {
              $group: {
                _id: null,
                average: { $avg: '$rating' },
              },
            },
          ],
          totalRatingsCount: [
            // second branch of aggregation to calculate total ratings , or we could do countDocuments() in separate query
            {
              $match: {
                tour: new mongoose.Types.ObjectId(tourID),
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const tourRatingsStats = await TourReviews.aggregate(
      ratingDistributionPipeline
    );

    res.status(200).json({
      status: 'success',
      data: {
        ratingsDistribution: tourRatingsStats?.[0]?.ratingsDistribution,
        averageRating: tourRatingsStats?.[0]?.averageRating?.[0]?.average ?? 0,
        totalRatings: tourRatingsStats?.[0]?.totalRatingsCount?.[0]?.count ?? 0,
      },
    });
  }
);

export const getTourReviews = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { tourID } = req.params;
    const { sortBy = 'highest', page = 1 } = req.query || {};

    if (!tourID) throw new AdventourAppError('Invalid tour ID!', 404);

    const limit = 3;

    const pageInt = Number(page) || 1;
    const totalReviews = await TourReviews.countDocuments({
      tour: tourID,
    });

    const totalPages = Math.ceil(totalReviews / limit);

    if (pageInt > totalPages) {
      throw new AdventourAppError('Page not found!', 404);
    }

    const skip = (pageInt - 1) * limit;

    const tourReviews = await TourReviews.find({ tour: tourID })
      .populate({
        path: 'user',
        select: 'userName avatar -_id',
      })
      .sort({
        rating: sortBy === 'highest' ? -1 : 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      totalResults: tourReviews.length,
      data: {
        tourReviews,
      },

      pagination: {
        totalPageCount: totalPages,
        page: pageInt,
      },
    });
  }
);
