import { Queue } from 'bullmq';

const options = {
  connection: {
    host: 'redis',
    port: 6379,
  },
};

export const queueName = 'process-new-tours';

const processNewToursQueue = new Queue(queueName, options);

export default processNewToursQueue;
