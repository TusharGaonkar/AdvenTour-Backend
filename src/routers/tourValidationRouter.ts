import express from 'express';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import { addTourToValidation } from '../controllers/tourValidationController';

const tourValidationRouter = express.Router();

tourValidationRouter
  .route('/')
  .post(
    requiresAuthentication,
    requiresAuthorization(['admin', 'user']),
    addTourToValidation
  );

export default tourValidationRouter;
