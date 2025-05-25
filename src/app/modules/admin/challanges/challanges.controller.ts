// Importing necessary utilities and dependencies
import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { ChallengeService } from './challanges.service';

// Controller function to create a new "Create Challenge" entry
const createChallenge = catchAsync(async (req, res) => {
     // Calling the service to create a new entry
     const result = await ChallengeService.createChallenge(req.body);

     // Sending a success response with the result
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Challenge created successfully',
          data: result,
     });
});

// Controller function to get all "Create Challenge" entries, with pagination
const getAllCreateChallenge = catchAsync(async (req, res) => {
     // Fetching all "Create Challenge" entries using query parameters (e.g., for pagination)
     const result = await ChallengeService.getAllChallenge(req.query);

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});

// Controller function to fetch a specific "Create Challenge" entry by ID
const singleChallenge = catchAsync(async (req, res) => {
     // Fetching a specific "Create Challenge" entry by ID
     const result = await ChallengeService.getSingleChallenge(req.params.id);

     // Sending the response with the result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Create Challenge" entry
const updateChallenge = catchAsync(async (req, res) => {
     // Updating the "Create Challenge" entry by ID with the data from the request body
     const result = await ChallengeService.updateChallenge(req.params.id, req.body);

     // Sending the response with the updated result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge updated successfully',
          data: result,
     });
});

// Controller function to delete a "Create Challenge" entry by ID
const deleteChallenge = catchAsync(async (req, res) => {
     // Deleting the "Create Challenge" entry by ID
     const result = await ChallengeService.deleteChallenge(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge deleted successfully',
          data: result,
     });
});
const getChallenge = catchAsync(async (req, res) => {
     // Deleting the "Create Challenge" entry by ID
     const result = await ChallengeService.deleteChallenge(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result,
     });
});

export const ChallengeController = { createChallenge, getAllCreateChallenge, singleChallenge, updateChallenge, deleteChallenge, getChallenge };
