import { Queue } from 'bullmq';

const options = {
  connection: {
    host: 'redis',
    port: 6379,
  },
};

export const queueName = 'user-reset-password';

const userResetPasswordQueue = new Queue(queueName, options);

export default userResetPasswordQueue;
