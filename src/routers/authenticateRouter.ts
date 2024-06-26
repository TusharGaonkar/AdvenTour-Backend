import express from 'express';
import passport from '../authentication/passport';
import { Request , Response, NextFunction } from 'express'
import { HydratedDocument } from 'mongoose';
import { loginUser, logoutUser } from '../controllers/loginUserController';
import loginAdmin from '../controllers/loginAdminController';
import registerNewUser from '../controllers/registerNewUserController';
import { addForgotPasswordJob } from '../controllers/forgotPasswordController';
import resetPassword from '../controllers/resetPasswordController';
import {
  successResponse,
  verifyToken,
} from '../controllers/verifyTokenController';

const authenticateRouter = express.Router();

authenticateRouter.route('/login').post(loginUser);
authenticateRouter.route('/admin/login').post(loginAdmin);

authenticateRouter.route('/register').post(registerNewUser);

authenticateRouter.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// On google login success
authenticateRouter.route('/google/callback').get(
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'google',
      {
        failureRedirect: '/auth/google/failure',
        session: false,
      },
      (error, user) => {
        if (error || !user) {
          return res.redirect(`${process.env.FRONTEND_BASE_URL}/login`);
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  },
  (req: Request , res: Response) => {
    const user: HydratedDocument<any> = req.user;
    const token = user.generateJwtToken();

    res.cookie(process.env.JWT_TOKEN_KEY, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      domain : `.${process.env.BACKEND_DOMAIN}`,
      path : '/'
    });

    res.redirect(process.env.FRONTEND_BASE_URL);
  }
);

authenticateRouter.route('/google/failure').get((req: Request, res: Response, next: NextFunction) => {
  res.redirect(`${process.env.FRONTEND_BASE_URL}/login`);
});

authenticateRouter.route('/forgotPassword').post(addForgotPasswordJob);
authenticateRouter.route('/resetPassword').post(resetPassword);
authenticateRouter.route('/logout').post(logoutUser);

authenticateRouter.route('/verifyToken').get(verifyToken, successResponse);

export default authenticateRouter;
