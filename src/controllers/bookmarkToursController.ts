import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import BookMarkedTours from '../models/bookmarkToursModel';

export const getUserBookmarks = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    try {
      if (!req.user) {
        throw new AdventourAppError('User not found', 404);
      }

      const getAllBookmarks = await BookMarkedTours.find({
        user: req.user._id,
        tour: { $exists: true, $ne: null },
      }).populate({
        path: 'tour',
        select: '_id title mainCoverImage',
      });

      return res.status(200).json({
        status: 'success',
        totalResults: !getAllBookmarks ? 0 : getAllBookmarks.length,
        data: {
          bookmarks: getAllBookmarks,
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
