import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(__dirname, '..', 'config.env'),
});

import express from 'express';
import morgan from 'morgan';
import addRequestTime from './middlewares/addRequestTime';
import tourRouter from './routers/tourRouter';
import AdentourAppError from './utils/adventourAppError';
import apiErrorHandler from './middlewares/apiErrorHandler';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(addRequestTime);

app.use('/api/v-1.0/tours', tourRouter);

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
