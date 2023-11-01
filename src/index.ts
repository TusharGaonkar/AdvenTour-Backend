import express from 'express';
import morgan from 'morgan';
import addRequestTime from './middlewares/addRequestTime';
import tourRouter from './routers/tourRouter';
import path from 'path';
import dotenv from 'dotenv';

const app = express();

dotenv.config({
  path: path.join(__dirname, '..', 'config.env'),
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(addRequestTime);

app.use('/api/v-1.0/tours', tourRouter);

export default app;
