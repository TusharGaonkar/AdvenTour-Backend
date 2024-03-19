import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import BookMarkedTours from '../models/bookmarkToursModel';
import { PipelineStage } from 'mongoose';

export const getUserBookmarks = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    try {
      if (!req.user) {
        throw new AdventourAppError('User not found', 404);
      }

      const { search = '', page = 1, limit = 6 } = req.query || {};

      const getBookmarksPipeline: PipelineStage[] = [
        {
          $match: {
            user: req.user._id,
            tour: {
              $exists: true,
              $ne: null,
            },
          },
        },
        {
          $lookup: {
            from: 'tours',
            localField: 'tour',
            foreignField: '_id',
            as: 'tour',
          },
        },
        {
          $unwind: {
            path: '$tour',
          },
        },
      ];

      if (search) {
        getBookmarksPipeline.push({
          $match: {
            'tour.title': {
              $regex: new RegExp((search as string).trim(), 'i'),
            },
          },
        });
      }

      let totalBookmarksPipeline: PipelineStage[] = [
        ...getBookmarksPipeline,
        {
          $count: 'totalBookmarks',
        },
      ];

      const paginationPipeline: PipelineStage[] = [
        {
          $skip: (Number(page) - 1) * Number(limit),
        },
        {
          $limit: Number(limit),
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            'tour._id': 1,
            'tour.title': 1,
            'tour.mainCoverImage': 1,
            createdAt: 1,
          },
        },
      ];

      const bookmarksData = await BookMarkedTours.aggregate([
        {
          $facet: {
            bookmarks: [...getBookmarksPipeline, ...paginationPipeline] as any,
            totalBookmarks: totalBookmarksPipeline as any,
          },
        },
      ]);

      const { totalBookmarks = 0 } =
        bookmarksData?.[0]?.totalBookmarks?.[0] ?? {};
      const bookmarks = bookmarksData?.[0]?.bookmarks ?? [];
      const totalPages = Math.ceil(totalBookmarks / Number(limit));

      res.status(200).json({
        status: 'success',
        data: {
          bookmarks,
        },
        pagination: {
          totalPages,
          currentPage: Number(page),
        },
      });
    } catch (error) {
      throw new AdventourAppError(
        error.message ?? 'Something went wrong while fetching bookmarks',
        500
      );
    }
  }
);

export const createBookmark = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    try {
      if (!req.user) {
        throw new AdventourAppError('User not found', 404);
      }

      console.log(req.body.tourId, req.user._id);
      await BookMarkedTours.create({
        tour: req.body.tourId,
        user: req.user._id,
      });

      res.status(201).json({
        status: 'success',
        totalResults: 1,
        data: {
          tour: req.body.tourId,
          user: req.user._id,
        },
      });
    } catch (error) {
      throw new AdventourAppError(
        error.message ?? 'Something went wrong while creating bookmark',
        500
      );
    }
  }
);

export const deleteBookmark = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    try {
      if (!req.user) {
        throw new AdventourAppError('User not found', 404);
      }

      await BookMarkedTours.findOneAndDelete({
        tour: req.body.tourId,
        user: req.user._id,
      });

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      throw new AdventourAppError(
        error.message ?? 'Something went wrong while deleting bookmark',
        500
      );
    }
  }
);
