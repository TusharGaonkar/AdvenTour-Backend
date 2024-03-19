import { Resend } from 'resend';
import AdventourAppError from '../utils/adventourAppError';

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendEmailProps = {
  to: string;
  from?: string;
  cc?: string | string[] | undefined;
  bcc?: string | string[] | undefined;
  reply_to?: string | string[] | undefined;
  subject: string;
  text: string;
  html: string;
};

const sendEmail = async (sendEmailConfig: SendEmailProps) => {
  try {
    if (!process.env.RESEND_API_KEY)
      throw new AdventourAppError(
        'Please provide a resend api key in the .env file',
        500
      );

    const { data, error } = await resend.emails.send({
      from: 'AdvenTour <onboarding@resend.dev>',
      ...sendEmailConfig,
      reply_to: process.env.ADMIN_EMAIL,
    });

    if (error) {
      throw new AdventourAppError(error.message, 500);
    }

    return data;
  } catch (error) {
    throw new AdventourAppError(error.message, 500);
  }
};

export default sendEmail;
