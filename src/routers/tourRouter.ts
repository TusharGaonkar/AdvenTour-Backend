import {
  createSingleTour,
  deleteTourWithId,
  getAllTours,
  getTourWithId,
  updateTourWithId,
} from '../controllers/tourController';

import express from 'express';

import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import searchSuggestionsController from '../controllers/searchSuggestionsController';

const tourRouter = express.Router();

// GET is public , posting required authentication!
tourRouter.route('/').get(getAllTours).post(
  // requiresAuthentication,
  // requiresAuthorization(['user', 'admin']),
  createSingleTour
);

// search autocomplete route!
tourRouter.route('/suggestions').get(searchSuggestionsController);

tourRouter
  .route('/:tourID')
  .get(getTourWithId)
  .patch(updateTourWithId)
  .delete(deleteTourWithId);

export default tourRouter;
