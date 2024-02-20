import express from 'express';
import {
  createSingleTour,
  deleteTourWithId,
  getAllTours,
  getTourCost,
  getTourWithId,
  updateTourWithId,
} from '../controllers/tourController';

import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import searchSuggestionsController from '../controllers/searchSuggestionsController';
import optionalAuthentication from '../utils/optionalAuthentication';

const tourRouter = express.Router();

// GET is public , posting required authentication!
tourRouter
  .route('/')
  .get(optionalAuthentication, getAllTours)
  .post(
    requiresAuthentication,
    requiresAuthorization(['user', 'admin']),
    createSingleTour
  );

// search autocomplete route!
tourRouter.route('/suggestions').get(searchSuggestionsController);

tourRouter.route('/getTourCost').get(getTourCost);

//Place this below , else :tourID will be called for any route after tours/
tourRouter
  .route('/:tourID')
  .get(getTourWithId)
  .patch(updateTourWithId)
  .delete(deleteTourWithId);

export default tourRouter;
