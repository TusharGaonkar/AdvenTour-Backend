import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';
import Users from '../models/userModel';
import { Request } from 'express';

const extractTokenFromCookie = (req: Request) => {
  let token = null;
  const tokenKey = process.env.JWT_TOKEN_KEY;
  if (req?.cookies) {
    token = req.cookies[tokenKey];
  }

  return token;
};

// First try to extract the token from the auth header "Bearer"
// On failure , try to extract the JWT token with the tokenKey from the user request cookie
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    extractTokenFromCookie,
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

const verify = async (payload: any, callback: VerifiedCallback) => {
  try {
    const { userName, email } = payload;

    const user = await Users.findOne({ userName, email });

    if (!user) {
      return callback(null, false);
    }
    return callback(null, user);
  } catch (error) {
    return callback(error, false);
  }
};

const jwtStrategy = new Strategy(options, verify);

export default jwtStrategy;
