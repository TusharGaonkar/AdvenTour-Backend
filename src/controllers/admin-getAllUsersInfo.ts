import { Request, Response, NextFunction } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import Users from '../models/userModel';
import { filter } from 'lodash';
import { FilterQuery } from 'mongoose';

export const getAllUsersInfo = apiClientErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      role = 'local-guide',
      searchQuery = '',
    } = req.query || {};

    const filterCriteria: FilterQuery<any> = { $and: [{ role }] };

    if ((searchQuery as string).trim().length > 0) {
      filterCriteria.$and.push({
        $text: {
          $search: (searchQuery as string).trim(),
        },
      });
    }

    const totalUsersCount = await Users.countDocuments(filterCriteria);
    const totalPages = Math.ceil(totalUsersCount / (limit as number));

    const skip =
      (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const users = await Users.find(filterCriteria)
      .skip(skip)
      .limit(limit as number);

    res.status(200).json({
      status: 'success',
      pagination: {
        totalPages,
        page: parseInt(page as string, 10),
      },
      totalResults: totalUsersCount,
      data: {
        users,
      },
    });
  }
);
