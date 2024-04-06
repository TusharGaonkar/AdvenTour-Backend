import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'crypto';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import sendEmail from '../services/mailService';
import { render } from '@react-email/render';
import AdventourResetPasswordEmail from '../emails/AdventourResetEmail';
import { Job } from 'bullmq';
import userResetPasswordQueue from '../message-queues/queues/userResetPasswordQueue';

//  Generates a random 120 length random hex string!
export const generatePasswordResetToken = () => {
  const tokenLength = 60; //token final length will be twice the length of this!
  // returns a buffer , convert that to hex;
  const token = randomBytes(tokenLength).toString('hex');
  return token;
};

//  Hash the token , convert it into hex
export const hashToken = (token: string) => {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return tokenHash;
};

export const forgotPassword = async (job: Job) => {
  try {
    const { randomTokenString, randomTokenHash, firstName, email } = job.data;
    // Password expiration should start 10mins from the time dequeued from the queue, so adding this logic here
    // Date.now() gives milliseconds from epoch add 10 minutes to it
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;

    const updatedResetTokenWithExpiry = await Users.updateOne(
      { email },
      {
        passwordResetToken: randomTokenHash,
        passwordResetExpires,
      }
    );

    if (!updatedResetTokenWithExpiry)
      throw new AdventourAppError('Something went wrong', 500);

    const baseURL = process.env.BASE_URL;
    const resetPasswordLink = `${baseURL}/resetPassword?token=${randomTokenString}`;

    const html = render(
      AdventourResetPasswordEmail({
        userFirstname: firstName,
        resetPasswordLink,
      }),
      {
        pretty: true,
      }
    );

    const text = render(
      AdventourResetPasswordEmail({
        userFirstname: firstName,
        resetPasswordLink,
      }),
      {
        plainText: true,
      }
    );

    await sendEmail({
      to: email,
      subject: 'Your AdvenTour reset password request',
      text,
      html,
    });
  } catch (error) {
    throw error;
  }
};

// Enqueues the job to the userForgotPasswordQueue
export const addForgotPasswordJob = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AdventourAppError(
        'Please include email in the request body',
        400
      );
    }

    const isExistingUser = await Users.findOne({ email }).select(
      '_id userName authProvider'
    );

    if (!isExistingUser || isExistingUser.authProvider !== 'adventour') {
      if (!isExistingUser)
        throw new AdventourAppError(
          'No registered users found, please register',
          404
        );
      else
        throw new AdventourAppError(
          'Please login using your ' + isExistingUser.authProvider + ' account',
          401
        );
    }

    const firstName = isExistingUser.userName.split(' ')[0];

    let randomTokenString = generatePasswordResetToken();

    // Calculate the hash of the token, storing this hash in the db instead of the original token for security
    let randomTokenHash = hashToken(randomTokenString);

    // We need to update the passwordResetToken field in the user field in the db,
    // Store the hash of it instead of the token for security
    // We know this is random , still check if there are no other duplicate token in the users collections

    let isDuplicateToken = await Users.find({
      passwordResetToken: randomTokenHash,
    });

    // Keep generating random token till its not unique , in case of collision which is unlikely to happen, still as a security measure
    while (isDuplicateToken) {
      randomTokenString = generatePasswordResetToken();
      randomTokenHash = hashToken(randomTokenString);
      isDuplicateToken = await Users.findOne({
        passwordResetToken: randomTokenHash,
      });
    }

    // Add 3 retries on failure while sending password reset email
    await userResetPasswordQueue.add(
      'forgot-password',
      {
        randomTokenString,
        randomTokenHash,
        firstName,
        email,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 4000,
        },
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Password reset email enqueued',
    });
  }
);
