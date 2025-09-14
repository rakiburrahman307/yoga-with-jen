import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const transporter = nodemailer.createTransport({
     host: config.email.host,
     port: Number(config.email.port),
     secure: true,
     auth: {
          user: config.email.user,
          pass: config.email.pass,
     },
     debug: true,
     logger: true // This will show more detailed logs
});


const sendEmail = async (values: ISendEmail) => {
     try {
          logger.info(`Attempting to send email to: ${values.to}`);

          const info = await transporter.sendMail({
               from: `"Yoga With Jen" ${config.email.from}`,
               to: values.to,
               subject: values.subject,
               html: values.html,
          });

          logger.info('Mail sent successfully', info.accepted);
          return info.accepted;
     } catch (error) {
          errorLogger.error('Email sending failed', error);
     }
};

// const sendEmail = async (values: ISendEmail): Promise<boolean> => {
//      try {
//           const info = await transporter.sendMail({
//                from: `"Yoga With Jen" ${config.email.from}`,
//                to: values.to,
//                subject: values.subject,
//                html: values.html,
//           });

//           logger.info('Mail sent successfully', info.accepted);
//           return true;
//      } catch (error) {
//           errorLogger.error('Email sending failed', error);
//           return false;
//      }
// };
const sendEmailForAdmin = async (values: ISendEmail) => {
     try {
          const info = await transporter.sendMail({
               from: `"${values.to}" <${values.to}>`,
               to: config.email.user,
               subject: values.subject,
               html: values.html,
          });

          logger.info('Mail send successfully', info.accepted);
     } catch (error) {
          errorLogger.error('Email', error);
     }
};

export const emailHelper = {
     sendEmail,
     sendEmailForAdmin,
};
