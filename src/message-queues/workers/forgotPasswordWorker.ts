import { Worker, WorkerOptions } from 'bullmq';
import { queueName as userForgotPasswordQueueName } from '../queues/userResetPasswordQueue';
import { forgotPassword } from '../../controllers/forgotPasswordController';

// Handle rate limit as of worker as Resend Email api has a rate limit of 10 requests per second!
const options: WorkerOptions = {
  connection: {
    host: 'redis',
    port: 6379,
  },
  limiter: {
    max: 6,
    duration: 1000,
  },
};

const startForgotPasswordWorker = () =>
  new Worker(userForgotPasswordQueueName, forgotPassword, options);

export default startForgotPasswordWorker;
