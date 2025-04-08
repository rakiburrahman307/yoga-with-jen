import { StatusCodes } from 'http-status-codes';
import { emailHelper } from '../../../helpers/emailHelper';
import { TContact } from './contactus.interface';
import AppError from '../../../errors/AppError';
import { Contact } from './contactus.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import QueryBuilder from '../../builder/QueryBuilder';

const createContactToDB = async (contactData: TContact) => {
  const result = await Contact.create(contactData);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create contact');
  }
  //   Todo: send email\
  const contactEmailData = {
    email: result.email,
    name: result.name,
    subject: result.subject,
    message: result.message,
  };
  const contactEmailTemplate = emailTemplate.contact(contactEmailData);
  emailHelper.sendEmail(contactEmailTemplate);
  return result;
};
const getAllContactsFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Contact.find({}), query);
  const contacts = await queryBuilder
    .paginate()
    .fields()
    .paginate()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    contacts,
    meta,
  };
};

export const ContactService = {
  createContactToDB,
  getAllContactsFromDB,
};
