import { Worker, WorkerOptions } from 'bullmq';
import { queueName as processNewToursQueueName } from '../queues/processNewToursQueue';
import { addTourToValidation } from '../../controllers/tourValidationController';

// Handle rate limiting, process maximum of 2 new tours in 1 minute
const options: WorkerOptions = {
  connection: {
    host: 'redis',
    port: 6379,
  },
  limiter: {
    max: 2,
    duration: 60000,
  },
};

const startAddTourValidationWorker = () =>
  new Worker(processNewToursQueueName, addTourToValidation, options);

export default startAddTourValidationWorker;
