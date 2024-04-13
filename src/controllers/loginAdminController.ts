import { Request, Response } from 'express';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';
import { HydratedDocument } from 'mongoose';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';

const loginAdmin = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AdventourAppError(
        'Please provide email and password in the request!',
        400
      );
    }

    const existingUser: HydratedDocument<any> = await Users.findOne({
      email,
      role: 'admin',
    }).select('+password'); // password is not returned by default so we need to select it manually !

    if (!existingUser) {
      throw new AdventourAppError("Admin Doesn't Exist", 401);
    } else if (!(await existingUser.comparePassword(password))) {
      throw new AdventourAppError(
        'Incorrect password , Please try again!',
        401
      );
    }

    const token = existingUser.generateJwtToken();
    res.cookie(process.env.JWT_TOKEN_KEY, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // can't be read in the client side javascript ; prevent cross-site scripting and token stealing!
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // current expiration in 15 days in ms!
      domain: `${process.env.BACKEND_DOMAIN}`,
      path: '/'
    });

    const user = await Users.findOne({ email });
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  }
);

export default loginAdmin;
