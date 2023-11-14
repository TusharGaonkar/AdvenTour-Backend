import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'crypto';
import Users from '../models/userModel';
import AdventourAppError from '../utils/adventourAppError';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';

//generates a random 120 length random hex string!
export const generatePasswordResetToken = () => {
  const tokenLength = 60; //token final length will be twice the length of this!
  // returns a buffer , convert that to hex;
  const token = randomBytes(tokenLength).toString('hex');
  return token;
};

export const hashToken = (token: string) => {
  //hash the token , convert it into hex
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return tokenHash;
};

const forgotPassword = apiClientErrorHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AdventourAppError(
        'Please include email in the request body',
        400
      );
    }

    const isExistingUser = await Users.findOne({ email }).select('_id');
    if (!isExistingUser)
      throw new AdventourAppError(
        'No registered user found with this email',
        401
      );

    let randomTokenString = generatePasswordResetToken();

    // calculate the hash
    let randomTokenHash = hashToken(randomTokenString);

    //  we need to update the passwordResetToken field in the user field ok,
    // but we will store the hash of it instead of the token for security
    // we know this is random , still check if there are no other duplicate token in the users collections

    let isDuplicateToken = await Users.find({
      passwordResetToken: randomTokenHash,
    });

    // keep generating random token till its not unique , i am however unsetting the passwordResetToken once updated no need to do this though still as a security measure
    while (isDuplicateToken) {
      randomTokenString = generatePasswordResetToken();
      randomTokenHash = hashToken(randomTokenString);
      isDuplicateToken = await Users.findOne({
        passwordResetToken: randomTokenHash,
      });
    }

    // Date.now() gives milliseconds from epoch add 5 minutes to it
    const passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000);

    await Users.updateOne(
      { email },
      {
        passwordResetToken: randomTokenHash,
        passwordResetExpires,
      }
    );

    // send the token to the user's registered email ,I will implement this later node mailer with custom smtp / mail-gun
    // testing just send the token as res

    res.send(randomTokenString);
  }
);

export default forgotPassword;
