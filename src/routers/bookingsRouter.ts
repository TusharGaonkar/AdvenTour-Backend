import express from 'express';
import {
  createNewOrder,
  getGatewaykeyID,
  paymentVerification,
} from '../controllers/bookingsController';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';

const bookingsRouter = express.Router();

bookingsRouter
  .route('/getKeyID')
  .get(
    requiresAuthentication,
    requiresAuthorization(['user']),
    getGatewaykeyID
  );
bookingsRouter
  .route('/createOrder')
  .post(
    requiresAuthentication,
    requiresAuthorization(['user']),
    createNewOrder
  );

bookingsRouter.route('/verifyPayment').post(paymentVerification);

export default bookingsRouter;
