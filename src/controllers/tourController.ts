import Tour from '../models/tourModel';
import { Request, Response } from 'express';
import AdvenTourQueryBuilder from '../utils/adventourQueryBuilder';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import BookMarkedTours from '../models/bookmarkToursModel';

interface User {
  _id: string;
  [key: string]: any;
}

interface ModifiedRequest extends Request {
  user?: User;
  [key: string]: any;
}

//Creates a single tour
export const createSingleTour = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const tourData = req.body;
    const newTour = await Tour.create(tourData);
    res.status(201).json({
      status: 'success',
      totalResults: 1,
      data: {
        tour: newTour,
      },
    });
  }
);

// Create multiple tours , pass array of tour objects
export const createMultipleTours = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const tourData = req.body;
    const newTours = await Tour.insertMany(tourData);
    res.status(201).json({
      status: 'success',
      totalResults: newTours.length,
      data: {
        tour: newTours,
      },
    });
  }
);

// Advanced query builder for the get route
export const getAllTours = apiClientErrorHandler(
  async (req: ModifiedRequest, res: Response, next) => {
    let sanitizedQueryObj = new AdvenTourQueryBuilder(req, Tour)
      .getNearbyTours('tourLocation.coordinates')
      .searchData()
      .filterData()
      .sortData()
      .projectFields()
      .paginate();

    if (req.user && req.user?._id) {
      sanitizedQueryObj = await sanitizedQueryObj.addIsBookmarked(req.user?.id);
    }

    const tourList = await sanitizedQueryObj.getQuery();

    res.status(200).json({
      status: 'success',
      totalResults: tourList.length,
      data: {
        tours: tourList,
      },
    });
  }
);

//get a single tour with an id
export const getTourWithId = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { tourID } = req.params;
    const tour = await Tour.findById(tourID);
    res.status(200).json({
      status: 'success',
      totalResults: tour ? 1 : 0,
      data: {
        tour,
      },
    });
  }
);

//update a single tour with an id
export const updateTourWithId = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true, //if true, return the modified document
      runValidators: true, //run the validators on the schema before updating
    });

    res.status(200).json({
      status: 'success',
      totalResults: 1,
      data: {
        tour,
      },
    });
  }
);

// delete a single tour with an id
export const deleteTourWithId = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) throw new Error(`Tour with id ${id} not found`);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
