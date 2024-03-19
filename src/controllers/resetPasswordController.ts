import { Request, Response } from 'express';
import Users, { hashDBPassword } from '../models/userModel';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import { hashToken } from './forgotPasswordController';

const resetPassword = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { password, confirmPassword } = req.body;
    const { token: resetToken } = req.query;

    if (!resetToken)
      throw new AdventourAppError(
        'Please provide a token in the request query',
        400
      );
    else if (resetToken.length != 120 || typeof resetToken !== 'string')
      // incase a user does resetPassword?token["some query"] = 60 don't process such requests
      throw new AdventourAppError('Invalid token', 400);
    else if (!password || !confirmPassword)
      throw new AdventourAppError(
        'Please provide a password and confirm password in the request body',
        400
      );
    else if (password !== confirmPassword)
      throw new AdventourAppError('Passwords do not match', 400);

    const hashedResetToken = hashToken(resetToken as string);
    const hashedPassword = await hashDBPassword(password); // manually hash the password , findAndUpdate or updateOne doesn't trigger .pre("save") middleware as of now!

    const isExistingUser = await Users.findOneAndUpdate(
      {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: { $gte: Date.now() }, // check if it's a valid token the timer hasn't expired!
      },
      {
        $set: {
          password: hashedPassword,
          passwordLastUpdatedAt: new Date(Date.now()),
        },
        $unset: {
          passwordResetToken: 1, // unset the token
          passwordResetExpires: 1, //unset the expiry
        },
      },
      {
        new: true, // return the updated user doc
        runValidators: true,
      }
    );

    if (!isExistingUser)
      throw new AdventourAppError('Token has expired or invalid', 401);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  }
);

export default resetPassword;
