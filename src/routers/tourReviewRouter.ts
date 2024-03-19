import express from 'express';
import {
  getTourReviews,
  createTourReview,
  getTourRatingDistribution,
} from '../controllers/tourReviewController';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import uploadReviewImagesToServer from '../utils/adventourReviewImagesUpload';

const tourReviewRouter = express.Router();

tourReviewRouter
  .route('/ratingDistribution/:tourID')
  .get(getTourRatingDistribution);

// posting a review is restricted to authenticated users!
tourReviewRouter
  .route('/:tourID')
  .get(getTourReviews)
  .post(
    requiresAuthentication,
    requiresAuthorization(['user', 'local-guide', 'admin']),
    uploadReviewImagesToServer.array('reviewImages[]', 2),
    createTourReview
  );

export default tourReviewRouter;
