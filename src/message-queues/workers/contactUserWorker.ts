import { Worker, WorkerOptions } from 'bullmq';
import { queueName as contactUserQueueName } from '../queues/userEmailQueue';
import { contactUser } from '../../controllers/contactUser';

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

const startContactUserWorker = () =>
  new Worker(contactUserQueueName, contactUser, options);

export default startContactUserWorker;
