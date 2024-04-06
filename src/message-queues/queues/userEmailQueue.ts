import { Queue } from 'bullmq';

const options = {
  connection: {
    host: 'redis',
    port: 6379,
  },
};

export const queueName = 'user-email';

const userEmailQueue = new Queue(queueName, options);

export default userEmailQueue;
