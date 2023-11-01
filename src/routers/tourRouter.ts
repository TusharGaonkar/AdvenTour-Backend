import {
  createSingleTour,
  deleteTourWithId,
  getAllTours,
  getTourWithId,
  updateTourWithId,
} from '../controllers/tourController';

import express from 'express';

const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createSingleTour);

tourRouter
  .route('/:tourID')
  .get(getTourWithId)
  .patch(updateTourWithId)
  .delete(deleteTourWithId);

export default tourRouter;
