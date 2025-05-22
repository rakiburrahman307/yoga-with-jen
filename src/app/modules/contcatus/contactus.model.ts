import { model, Schema } from 'mongoose';
import { TContact } from './contactus.interface';

const contactSchema = new Schema<TContact>(
     {
          name: {
               type: String,
               required: true,
          },
          email: {
               type: String,
               required: true,
          },
          subject: {
               type: String,
               required: true,
          },
          message: {
               type: String,
               required: true,
          },
     },
     {
          timestamps: true,
     },
);

export const Contact = model<TContact>('Contact', contactSchema);
