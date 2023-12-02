import express from 'express';
import passport from '../authentication/passport';
import AdventourAppError from '../utils/adventourAppError';
import { HydratedDocument } from 'mongoose';
import loginUser from '../controllers/loginUserController';
import registerNewUser from '../controllers/registerNewUserController';
import forgotPassword from '../controllers/forgotPasswordController';
import resetPassword from '../controllers/resetPasswordController';
import {
  successResponse,
  verifyToken,
} from '../controllers/verifyTokenController';

const authenticateRouter = express.Router();

authenticateRouter.route('/login').post(loginUser);

authenticateRouter.route('/register').post(registerNewUser);

authenticateRouter.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

authenticateRouter.route('/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: false,
  }),
  (req, res) => {
    const user: HydratedDocument<any> = req.user;
    const token = user.generateJwtToken();

    res.cookie(process.env.JWT_TOKEN_KEY, token, {
      httpOnly: true,
      secure: true, // can't be read in the client side javascript ; prevent cross-site scripting and token stealing!
    });
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  }
);

authenticateRouter.route('/google/failure').get((req, res, next) => {
  next(new AdventourAppError('Google Authentication Failed', 401));
});

authenticateRouter.route('/forgotPassword').post(forgotPassword);
authenticateRouter.route('/resetPassword').post(resetPassword);
authenticateRouter.route('/verifyToken').get(verifyToken, successResponse);

export default authenticateRouter;
