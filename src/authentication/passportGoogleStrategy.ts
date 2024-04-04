import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import passport from 'passport';
import Users from '../models/userModel';

const options: StrategyOptions = {
  clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
};

const googleStrategy = new Strategy(options, async function (
  _accessToken,
  _refreshToken,
  profile,
  callback
) {
  const googleID = profile.id;

  const { name: userName, email, picture: avatar } = profile._json;

  try {
    // Check if the user has already used the email provided for other sing-in methods in AdvenTour
    const isRegisteredEmail = await Users.findOne({
      email,
      authProvider: { $ne: 'google' },
    });

    if (isRegisteredEmail) {
      // If the email is already registered with a different auth provider, return an error
      return callback(
        new Error(
          'This email is already registered. Please use a different email address.'
        )
      );
    }

    const existingUser = await Users.findOne({
      googleID,
      authProvider: 'google',
    });

    if (existingUser) return callback(null, existingUser);

    const newUser = await Users.create({
      googleID,
      userName,
      email,
      avatar,
      authProvider: 'google',
    });

    return callback(null, newUser);
  } catch (error) {
    return callback(error);
  }
});

passport.use(googleStrategy);

export default googleStrategy;
