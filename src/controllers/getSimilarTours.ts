import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import Tour from '../models/tourModel';
import mongoose, { PipelineStage } from 'mongoose';

const getSimilarTours = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { tourID = '' } = req.query || {};

    if (!tourID) throw new AdventourAppError('Please provide tour id', 400);

    // First get the tour category array of the requested tour
    const requestedTourCategory =
      await Tour.findById(tourID).select('tourCategory');

    if (!requestedTourCategory)
      throw new AdventourAppError('Tour not found', 404);

    const similarToursPipeline: PipelineStage[] = [
      {
        $match: {
          tourCategory: {
            $in: requestedTourCategory.tourCategory,
          },
          _id: {
            $ne: new mongoose.Types.ObjectId(tourID as string), // Don't pick the same tour as it will match all the categories
          },
        },
      },
      {
        $addFields: {
          commonCategories: {
            $size: {
              $setIntersection: [
                '$tourCategory',
                requestedTourCategory.tourCategory,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          mainCoverImage: 1,
          title: 1,
          ratingsAverage: 1,
          commonCategories: 1,
        },
      },
      {
        $sort: {
          commonCategories: -1,
        },
      },
      {
        $limit: 9,
      },
    ];

    const similarTours = await Tour.aggregate(similarToursPipeline);

    if (!similarTours || similarTours?.length < 3) {
      // It may happen that we found 2 similar tours in aggregation , and here we shouldn't add those again

      const matchedIds = [
        ...(similarTours?.map(
          (tour: any) => new mongoose.Types.ObjectId(tour._id)
        ) ?? []),
        new mongoose.Types.ObjectId(tourID as string),
      ];

      const remainingTours = await Tour.find({ _id: { $nin: matchedIds } })
        .select('_id mainCoverImage title ratingsAverage')
        .limit(5)
        .sort('-ratingsAverage');

      similarTours.push(...remainingTours);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        similarTours,
      },
    });
  }
);

export default getSimilarTours;
