import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContactService } from './contactus.service';

const createContact = catchAsync(async (req: Request, res: Response) => {
     const { ...contactData } = req.body;
     const result = await ContactService.createContactToDB(contactData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Contact created successfully',
          data: result,
     });
});
const getAllContacts = catchAsync(async (req: Request, res: Response) => {
     const result = await ContactService.getAllContactsFromDB(req.query);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Contacts retrieved successfully',
          data: result,
     });
});
const getsingleContact = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await ContactService.getSingleContactFromDB(id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Contacts retrieved successfully',
          data: result,
     });
});

export const ContactController = {
     createContact,
     getAllContacts,
     getsingleContact,
};
