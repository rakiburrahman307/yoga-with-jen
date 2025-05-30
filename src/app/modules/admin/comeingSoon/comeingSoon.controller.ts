// Importing necessary utilities and dependencies
import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { ComeingSoonService } from './comeingSoon.service'; // Service layer that interacts with the database or other business logic

// Controller function to create a new "Coming Soon" entry
const createComingSoon = catchAsync(async (req, res) => {
     // Calling the service to create a new entry
     const result = await ComeingSoonService.createComingSoon(req.body);

     // Sending a success response with the result
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Coming Soon created successfully',
          data: result,
     });
});

// Controller function to get all "Coming Soon" entries, with pagination
const getAllComingSoon = catchAsync(async (req, res) => {
     // Fetching all "Coming Soon" entries using query parameters (e.g., for pagination)
     const result = await ComeingSoonService.getAllComingSoon(req.query);

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});

// Controller function to fetch the latest "Coming Soon" content
const getComingSoonContentLetest = catchAsync(async (req, res) => {
     // Fetching the latest "Coming Soon" content
     const { id }: any = req.user;
     const result = await ComeingSoonService.getCommingSoonLetest(id);

     // Sending the response with the latest content
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result[0],
     });
});

// Controller function to fetch a single latest "Coming Soon" entry based on ID
const singleComingSoonLetest = catchAsync(async (req, res) => {
     // Fetching a specific "Coming Soon" entry by ID
     const { id }: any = req.user;
     const result = await ComeingSoonService.getComingSoonContentLetest(req.params.id, id);

     // Sending the response with the result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result,
     });
});

// Controller function to fetch a specific "Coming Soon" entry by ID
const singleComingSoon = catchAsync(async (req, res) => {
     // Fetching a specific "Coming Soon" entry by ID
     const result = await ComeingSoonService.getSingleComingSoon(req.params.id);

     // Sending the response with the result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Coming Soon" entry
const updateComingSoon = catchAsync(async (req, res) => {
     // Updating the "Coming Soon" entry by ID with the data from the request body
     const result = await ComeingSoonService.updateComingSoon(req.params.id, req.body);

     // Sending the response with the updated result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon updated successfully',
          data: result,
     });
});

// Controller function to delete a "Coming Soon" entry by ID
const deleteComingSoon = catchAsync(async (req, res) => {
     // Deleting the "Coming Soon" entry by ID
     const result = await ComeingSoonService.deleteComingSoon(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon deleted successfully',
          data: result,
     });
});

export const ComeingSoonController = {
     createComingSoon,
     getAllComingSoon,
     getComingSoonContentLetest,
     singleComingSoonLetest,
     singleComingSoon,
     updateComingSoon,
     deleteComingSoon,
};
