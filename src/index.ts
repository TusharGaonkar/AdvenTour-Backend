import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '..', 'config.env'),
});

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import addRequestTime from './middlewares/addRequestTime';
import tourRouter from './routers/tourRouter';
import authenticateRouter from './routers/authenticateRouter';
import tourReviewRouter from './routers/tourReviewRouter';
import tourValidationRouter from './routers/tourValidationRouter';
import adminRouter from './routers/adminRouter';
import userRouter from './routers/userRouter';
import guideRouter from './routers/guideRouter';
import bookingsRouter from './routers/bookingsRouter';
import emailRouter from './routers/emailRouter';
import AdventourAppError from './utils/adventourAppError';
import apiErrorHandler from './middlewares/apiErrorHandler';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN.split(','),
  })
);
app.use(cookieParser()); // need to parse cookies in req.cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(addRequestTime);

app.use('/api/v-1.0/auth', authenticateRouter);
app.use('/api/v-1.0/tours', tourRouter);
app.use('/api/v-1.0/tourReviews', tourReviewRouter);
app.use('/api/v-1.0/user', userRouter);
app.use('/api/v-1.0/tourValidation', tourValidationRouter);
app.use('/api/v-1.0/bookings', bookingsRouter);
app.use('/api/v-1.0/guide', guideRouter);
app.use('/api/v-1.0/admin', adminRouter);
app.use('/api/v-1.0/contactUser', emailRouter);
app.use('*', (req, res, next) => {
  next(
    new AdventourAppError(
      `No route found for ${req.originalUrl} on this server!`,
      404
    )
  );
});
// Custom error handler middleware
app.use(apiErrorHandler);

export default app;
