import { Request, Response } from 'express';
import Tour from '../models/tourModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';

const searchSuggestionsController = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { query } = req.query;

    try {
      if (typeof query !== 'string' || query.length === 0) {
        return res.status(200).json({
          status: 'success',
          totalResults: 0,
          data: {
            searchSuggestions: [],
          },
        });
      }
      const searchSuggestions = await Tour.aggregate([
        {
          $search: {
            index: 'autoComplete',
            compound: {
              should: [
                {
                  autocomplete: {
                    query,
                    path: 'title',
                  },
                },

                {
                  autocomplete: {
                    query,
                    path: 'tourCategory',
                  },
                },
                {
                  autocomplete: {
                    query,
                    path: 'itinerary.activities.place',
                  },
                },
              ],
            },

            highlight: {
              path: ['title', 'tourCategory', 'itinerary.activities.place'],
            },
          },
        },

        {
          $limit: 6,
        },
        {
          $project: {
            highlights: { $meta: 'searchHighlights' },
          },
        },
      ]);
      res.status(200).json({
        status: 'success',
        totalResults: searchSuggestions.length,
        data: {
          searchSuggestions,
        },
      });
    } catch (error) {
      throw new AdventourAppError(error.message, 500);
    }
  }
);

export default searchSuggestionsController;
