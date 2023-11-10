import { Request, Response, NextFunction } from 'express';
import AdventourAppError from '../utils/adventourAppError';
import Users from '../models/userModel';
import apiClientErrorHandler from './apiClientErrorHandler';
import { HydratedDocument } from 'mongoose';

// returns a middleware function captures  authorizedRoles from parent function as a closure , wrapping inside apiClientErrorHandler function to catch async errors!
const requiresAuthorization = (
  authorizedRoles: ('user' | 'local-guide' | 'admin')[]
) => {
  return apiClientErrorHandler(
    async (
      req: Request & { user: HydratedDocument<any> },
      res: Response,
      next: NextFunction
    ) => {
      const { userName, email } = req.user;
      const { role } = await Users.findOne({ userName, email }).select('role');
      if (authorizedRoles.includes(role)) {
        return next();
      } else
        throw new AdventourAppError(
          'You are unauthorized to this resource!',
          403
        );
    }
  );
};

export default requiresAuthorization;
