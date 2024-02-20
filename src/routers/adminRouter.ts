import express from 'express';
import {
  getAllToursForAdmin,
  getTourWithID,
} from '../controllers/admin-getAllToursInfo';

import {
  acceptTour,
  rejectTour,
} from '../controllers/admin-tourApprovalController';

import { getAllBookingsInfo } from '../controllers/admin-getAllBookingsInfo';

import { getAllUsersInfo } from '../controllers/admin-getAllUsersInfo';
import { getPaymentInfo } from '../controllers/admin-getAllPaymentsInfo';
import { cancelAndRefundBooking } from '../controllers/admin-Cancel_RefundBooking';
import { getTourStats } from '../controllers/admin-getTourStats';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';

const adminRouter = express.Router();

// Middleware to protect routes: If a user logs out in one tab, it clears the token cookie,
// potentially causing errors in other tabs. Redirect to login page on further requests
// to prevent errors and ensure a consistent user experience across multiple tabs.
// Applies to all routes below this middleware.

adminRouter.use([requiresAuthentication, requiresAuthorization(['admin'])]);

adminRouter.route('/getStats').get(getTourStats);
adminRouter.route('/getTours').get(getAllToursForAdmin);
adminRouter.route('/tours/:id').get(getTourWithID);
adminRouter.route('/getAllUsersInfo').get(getAllUsersInfo);
adminRouter.route('/getAllBookingsInfo').get(getAllBookingsInfo);
adminRouter.route('/getPaymentInfo').get(getPaymentInfo);

adminRouter.route('/cancelBooking').post(cancelAndRefundBooking);
adminRouter.route('/tours/acceptTour').post(acceptTour);
adminRouter.route('/tours/rejectTour').post(rejectTour);

export default adminRouter;
