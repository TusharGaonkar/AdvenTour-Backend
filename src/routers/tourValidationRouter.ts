import express from 'express';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';
import { processNewToursJob } from '../controllers/tourValidationController';

const tourValidationRouter = express.Router();

tourValidationRouter
  .route('/')
  .post(
    requiresAuthentication,
    requiresAuthorization(['admin', 'user']),
    processNewToursJob
  );

export default tourValidationRouter;
