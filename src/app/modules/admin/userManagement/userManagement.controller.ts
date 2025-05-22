import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { userManagementService } from './userManagement.service';

// get all the user
const getAllUsers = catchAsync(async (req, res) => {
     const result = await userManagementService.getUsersFromDb(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Users retrived successfuly',
          data: result.users,
          pagination: result.meta,
     });
});
// get single user
const getUser = catchAsync(async (req, res) => {
     const result = await userManagementService.getSingleUser(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Users retrived successfuly',
          data: result,
     });
});
// update status
const userStatusChange = catchAsync(async (req, res) => {
     const { status } = req.body;
     const result = await userManagementService.updateUsersFromDb(req.params.id, status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'User status updated',
          data: result,
     });
});

export const userManagementController = {
     getAllUsers,
     getUser,
     userStatusChange,
};
