import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { quotationManagementService } from './quotationManagement.service';

// get all the user
const createQuotation = catchAsync(async (req, res) => {
     const result = await quotationManagementService.createQuotation(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.CREATED,
          message: 'Quotation created successfuly',
          data: result,
     });
});
// get single user
const getAllQuotation = catchAsync(async (req, res) => {
     const result = await quotationManagementService.getQuotationFromDb();
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Quotation retrived successfuly',
          data: result,
     });
});
// update status
const getByIdQuotation = catchAsync(async (req, res) => {
     const result = await quotationManagementService.getSingleQuotation(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Quotation retrived successfuly',
          data: result,
     });
});
// update quotation
const updateQuotation = catchAsync(async (req, res) => {
     const data = req.body;
     const result = await quotationManagementService.updateQuotationFromDb(req.params.id, data);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Quotation updated successfuly',
          data: result,
     });
});
// update status
const updateStatusQuotation = catchAsync(async (req, res) => {
     const { status } = req.body;
     const result = await quotationManagementService.updateQuotationStatusFromDb(req.params.id, status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Quotation status updated successfuly',
          data: result,
     });
});
// delete status
const deleteQuotation = catchAsync(async (req, res) => {
     const result = await quotationManagementService.deleteQuotationFromDb(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Quotation deleted successfuly',
          data: result,
     });
});

export const QuotationManagementController = {
     createQuotation,
     getAllQuotation,
     getByIdQuotation,
     updateQuotation,
     deleteQuotation,
     updateStatusQuotation,
};
