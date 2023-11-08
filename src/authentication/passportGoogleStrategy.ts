import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import passport from 'passport';

const options: StrategyOptions = {
  clientID: 'ijjdijfdif',
  clientSecret: 'dfjdfijdfijdif',
  callbackURL: 'ijfidjfidjfijfidfj',
};

const googleStrategy = new Strategy(
  options,
  (_accessToken, _refreshToken, profile, done) => {
    return done(null, profile);
  }
);

export default googleStrategy;
