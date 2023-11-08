import {
  Strategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';
import passport from 'passport';
import { Request } from 'express';

const verify = (payload: any, callback: VerifiedCallback) => {
  return callback(null, payload, 'working properly');
};

const extractTokenFromCookie = (req: Request) => {
  let token = null;
  const tokenKey = 'adventourJwtToken';
  if (req?.cookies) {
    console.log(req.cookies);
    token = req.cookies[tokenKey];
  }

  return token;
};

// first try to extract the cookie from the auth header "Bearer" else just check a cookie for the token
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    extractTokenFromCookie,
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new Strategy(options, verify);

export default jwtStrategy;
