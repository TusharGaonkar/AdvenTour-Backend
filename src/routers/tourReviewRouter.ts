import express from 'express';
import {
  getTourReviews,
  createTourReview,
} from '../controllers/tourReviewController';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';

const tourReviewRouter = express.Router();

// posting a review is restricted to authenticated users!
tourReviewRouter
  .route('/:tourID')
  .get(getTourReviews)
  .post(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    createTourReview
  );

export default tourReviewRouter;
