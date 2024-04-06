import { Request, Response } from 'express';
import apiClientErrorHandler from '../middlewares/apiClientErrorHandler';
import AdventourAppError from '../utils/adventourAppError';
import sendEmail from '../services/mailService';
import { render } from '@react-email/render';
import ContactUserEmail from '../emails/ContactUserEmail';
import { SendEmailProps } from '../services/mailService';
import userEmailQueue from '../message-queues/queues/userEmailQueue';
import { Job } from 'bullmq';

export const contactUser = async (job: Job) => {
  try {
    const { to, subject, message, user } = job.data;

    const text = render(ContactUserEmail({ subject, message }), {
      plainText: true,
    });

    const html = render(ContactUserEmail({ subject, message }), {
      pretty: true,
    });

    const sendEmailConfig: SendEmailProps = {
      from: `${user.userName} - ${
        user.role === 'local-guide' ? 'Local Guide' : 'Admin'
      }, AdvenTour <onboarding@resend.dev>`,
      to,
      subject,
      text,
      html,
      cc: user.role === 'local-guide' ? process.env.ADMIN_EMAIL : undefined,
      reply_to:
        user.role === 'local-guide'
          ? [process.env.ADMIN_EMAIL, user.email]
          : process.env.ADMIN_EMAIL,
    };

    await sendEmail(sendEmailConfig);
  } catch (error) {
    // this failed job will be retried ok by the worker
    throw error;
  }
};

export const addContactUserJob = apiClientErrorHandler(
  async (req: Request & { user: any }, res: Response) => {
    const user = req.user;

    if (!user) throw new AdventourAppError('User not found', 401);

    const {
      to = '',
      subject = '',
      message = '',
    }: { to: string; subject: string; message: string } = req.body || {};

    if (!to || !subject || !message)
      throw new AdventourAppError(
        'Please provide "to", "subject" and "message" fields',
        400
      );

    // add the job to the queue, in case of failure retry this job for 3 times
    await userEmailQueue.add(
      'contact-user',
      {
        to,
        subject,
        message,
        user,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 4000 },
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Email enqueued successfully',
    });
  }
);
