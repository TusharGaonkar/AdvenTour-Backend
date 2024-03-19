import express from 'express';
import contactUser from '../controllers/contactUser';
import requiresAuthentication from '../middlewares/authenticationHandler';
import requiresAuthorization from '../middlewares/authorizationHandler';

const emailRouter = express.Router();

emailRouter
  .route('/')
  .post(
    requiresAuthentication,
    requiresAuthorization(['admin', 'local-guide']),
    contactUser
  );

export default emailRouter;
