import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '..', 'config.env'),
});

import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import addRequestTime from './middlewares/addRequestTime';
import tourRouter from './routers/tourRouter';
import AdentourAppError from './utils/adventourAppError';
import apiErrorHandler from './middlewares/apiErrorHandler';
import passport from './authentication/passport'; // just import the passport conf , strategies already configured

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(cookieParser()); // need to parse cookies in req.cookies
app.use(express.json());
app.use(addRequestTime);

app.use('/api/v-1.0/tours', tourRouter);
app.post(
  '/api/v-1.0/login',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  (req, res) => console.log(req)
);
app.use('*', (req, res, next) => {
  next(
    new AdentourAppError(
      `No route found for ${req.originalUrl} on this server!`,
      404
    )
  );
});

// Custom error handler middleware
app.use(apiErrorHandler);

export default app;
