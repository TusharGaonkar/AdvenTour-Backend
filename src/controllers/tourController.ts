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

export const getTourCost = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const {
      tourID = '',
      startDate,
      peopleCount,
    }: {
      tourID: string;
      startDate: string;
      peopleCount: string;
    } = (req.query as any) || {};

    if (!startDate || !peopleCount || !tourID) {
      throw new AdventourAppError(
        'Please provide start date, number of people and tour id',
        400
      );
    }

    const tour: {
      maxPeoplePerBooking: number;
      priceInRupees: number;
      discountInRupees: number;
      tourStartDates: Date[];
    } = await Tour.findById(tourID).select(
      'priceInRupees tourStartDates maxPeoplePerBooking discountInRupees'
    );

    if (!tour) {
      throw new AdventourAppError('Tour not found', 404);
    } else if (tour.maxPeoplePerBooking < parseInt(peopleCount, 10)) {
      throw new AdventourAppError('Maximum people per booking exceeded', 400);
    } else if (
      !tour.tourStartDates.some(
        (date) => date.toDateString() === new Date(startDate).toDateString()
      )
    ) {
      throw new AdventourAppError('Start date not available', 400);
    }

    const totalCost =
      (tour.priceInRupees - tour.discountInRupees) * parseInt(peopleCount, 10);
    const discount = (tour.discountInRupees ?? 0) * parseInt(peopleCount, 10);

    res.status(200).json({
      status: 'success',
      data: {
        pricePerPerson: tour.priceInRupees,
        totalCost,
        discount,
        bookingFor: parseInt(peopleCount, 10),
        selectedDate: new Date(startDate).toDateString(),
      },
    });
  }
);
