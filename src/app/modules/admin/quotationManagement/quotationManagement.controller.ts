import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { quotationManagementService } from './quotationManagement.service';

// get all the user
const createQuotation = catchAsync(async (req, res) => {
  const result = await quotationManagementService.getUsersFromDb(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Quotation created successfuly',
    data: result.users,
    pagination: result.meta,
  });
});
// get single user
const getAllQuotation = catchAsync(async (req, res) => {
  const result = await quotationManagementService.getSingleUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Quotation retrived successfuly',
    data: result,
  });
});
// update status
const getByIdQuotation = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await quotationManagementService.updateUsersFromDb(
    req.params.id,
    status,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Quotation retrived successfuly',
    data: result,
  });
});
// update status
const updateQuotation = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await quotationManagementService.updateUsersFromDb(
    req.params.id,
    status,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Quotation status updated',
    data: result,
  });
});
// update status
const deleteQuotation = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await quotationManagementService.updateUsersFromDb(
    req.params.id,
    status,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Quotation status updated',
    data: result,
  });
});

export const QuotationManagementController = {
  createQuotation,
  getAllQuotation,
  getByIdQuotation,
  updateQuotation,
  deleteQuotation
};
