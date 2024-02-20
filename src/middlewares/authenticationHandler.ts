import { Request, Response, NextFunction } from 'express';
import passport from '../authentication/passport';

const requiresAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false, failWithError: true })(
    req,
    res,
    next
  );
};

export default requiresAuthentication;
