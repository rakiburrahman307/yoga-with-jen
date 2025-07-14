// Importing necessary utilities and dependencies
import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { ChallengeService } from './challengesCategory.service';
// challengeCategory related

const createChallengeCategory = catchAsync(async (req, res) => {
     const result = await ChallengeService.createChallengeCategory(req.body);
     // Sending a success response with the result
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Challenge Category created successfully',
          data: result,
     });
});
const getAllChallengeCategory = catchAsync(async (req, res) => {
     const result = await ChallengeService.getAllChallengeCategory(req.query);

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge Category retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});
const getAllChallengeCategoryForUser = catchAsync(async (req, res) => {
     const result = await ChallengeService.getAllChallengeCategoryForUser(req.query);
     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge Category retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});

const getSingleChallengeCategory = catchAsync(async (req, res) => {
     // Fetching all "Create Challenge" entries using query parameters (e.g., for pagination)
     const result = await ChallengeService.getSingleChallengeCategory(req.params.id);

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge Category retrieved successfully',
          data: result,
     });
});

const updateChallengeCategory = catchAsync(async (req, res) => {
     // Updating the "Create Challenge" entry by ID with the data from the request body
     const result = await ChallengeService.updateChallengeCategory(req.params.id, req.body);

     // Sending the response with the updated result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge Category updated successfully',
          data: result,
     });
});
const deleteChallengeCategory = catchAsync(async (req, res) => {
     // Deleting the "Create Challenge" entry by ID
     const result = await ChallengeService.deleteChallengeCategory(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge Category deleted successfully',
          data: result,
     });
});
const shuffleCategorySerial = catchAsync(async (req, res) => {
     const result = await ChallengeService.shuffleCategorySerial(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Challenge Category retrieved successfully',
          data: result,
     });
});
const statusUpdate = catchAsync(async (req, res) => {
     const result = await ChallengeService.statusUpdate(req.params.id, req.body.status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Challenge Category retrieved successfully',
          data: result,
     });
});
export const ChallengeController = {
     getSingleChallengeCategory,
     createChallengeCategory,
     getAllChallengeCategory,
     updateChallengeCategory,
     deleteChallengeCategory,
     getAllChallengeCategoryForUser,
     shuffleCategorySerial,
     statusUpdate
};
