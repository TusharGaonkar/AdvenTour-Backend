import express from 'express';
import {
  createSingleTour,
  deleteTourWithId,
  getAllTours,
  getTourCost,
  getTourWithId,
  updateTourWithId,
  getTopReviews,
  getTopTours
} from '../controllers/tourController';

import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import searchSuggestionsController from '../controllers/searchSuggestionsController';
import optionalAuthentication from '../utils/optionalAuthentication';
import getSimilarTours from '../controllers/getSimilarTours';

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

// Search autocomplete route!
tourRouter.route('/suggestions').get(searchSuggestionsController);

tourRouter.route('/getTourCost').get(getTourCost);
tourRouter.route('/getSimilarTours').get(getSimilarTours);

// For Adventour landing page
tourRouter.route('/topTours').get(getTopTours);
tourRouter.route('/topReviews').get(getTopReviews);

//  *Place this below , else :tourID will be called for any route after tours/
tourRouter
  .route('/:tourID')
  .get(getTourWithId)
  .patch(updateTourWithId)
  .delete(deleteTourWithId);

export default tourRouter;
