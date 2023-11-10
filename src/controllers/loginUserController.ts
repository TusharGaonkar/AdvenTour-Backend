import { Request, Response } from 'express';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';
import { HydratedDocument } from 'mongoose';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';

const loginUser = apiClientErrorHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AdventourAppError(
      'Please provide email and password in the request!',
      400
    );
  }

  const existingUser: HydratedDocument<any> = await Users.findOne({
    email,
  }).select('+password'); // password is not returned by default so we need to select it manually !

  if (!existingUser) {
    throw new AdventourAppError("User Doesn't Exist", 404);
  } else if (!(await existingUser.comparePassword(password))) {
    throw new AdventourAppError('Incorrect password , Please try again!', 401);
  }

  const token = existingUser.generateJwtToken();
  res.cookie(process.env.JWT_TOKEN_KEY, token, {
    httpOnly: true,
    secure: true, // can't be read in the client side javascript ; prevent cross-site scripting and token stealing!
  });

  const user = await Users.findOne({ email });
  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

export default loginUser;
