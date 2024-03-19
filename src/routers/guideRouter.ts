import express from 'express';
import requiresAuthentication from '../middlewares/authenticationHandler';
import { getGuideBookingsInfo } from '../controllers/guide-getAllBookingsInfo';
import getBookingsStatsForGuide from '../controllers/guide-getBookingsStats';
import requiresAuthorization from '../middlewares/authorizationHandler';

const guideRouter = express.Router();

guideRouter
  .route('/allBookings')
  .get(
    requiresAuthentication,
    requiresAuthorization(['local-guide', 'admin']),
    getGuideBookingsInfo
  );

guideRouter
  .route('/bookingStats')
  .get(
    requiresAuthentication,
    requiresAuthorization(['local-guide']),
    getBookingsStatsForGuide
  );

export default guideRouter;
