import passport from 'passport';
import jwtStrategy from './passportJwtStrategy';
import googleStrategy from './passportGoogleStrategy';

passport.use(jwtStrategy);
passport.use(googleStrategy);

export default passport;
