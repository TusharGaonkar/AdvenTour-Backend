import passport from '../authentication/passport';
import { Request, Response, NextFunction } from 'express';

const optionalAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    // if there is an error skip it as it's optional!
    if (err || !user) {
      return next();
    }

    // if there is a user, add it to the request manually!
    req.user = user;
    return next();
  })(req, res, next);
};

export default optionalAuthentication;
