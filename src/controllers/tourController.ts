import Tour from '../models/tourModel';
import { Request, Response } from 'express';
import AdvenTourQueryBuilder from '../utils/adventourQueryBuilder';

//Creates a single tour
export const createSingleTour = async (req: Request, res: Response) => {
  try {
    const tourData = req.body;
    const newTour = await Tour.create(tourData);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

// Create multiple tours , pass array of tour objects
export const createMultipleTours = async (req: Request, res: Response) => {
  try {
    const tourData = req.body;
    const newTours = await Tour.insertMany(tourData);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const sanitizedQueryObj = await new AdvenTourQueryBuilder(req, Tour)
      .filterData()
      .sortData('createdAt')
      .projectFields()
      .paginate();

    const tourList = await sanitizedQueryObj.getQuery();

    res.status(200).json({
      status: 'success',
      totalResults: tourList.length,
      data: {
        tours: tourList,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error,
    });
  }
};

export const getTourWithId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

export const updateTourWithId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true, //if true, return the modified document
      runValidators: true, //run the validators on the schema before updating
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

export const deleteTourWithId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) throw new Error(`Tour with id ${id} not found`);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
