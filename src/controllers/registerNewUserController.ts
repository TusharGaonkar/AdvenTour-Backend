import { Request, Response } from 'express';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';

const registerNewUser = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      throw new AdventourAppError(
        'Please provide userName, email and password in the request!',
        400
      );
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) throw new AdventourAppError('User already exists!', 400);
    await Users.create({
      userName,
      password,
      email,
    }); // default selects all the fields of the document including those which are specified as false so use find below

    const user = await Users.findOne({ userName, email });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
);

export default registerNewUser;
