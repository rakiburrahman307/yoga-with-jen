// Importing necessary utilities and dependencies
import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { DailyInspirationService } from './dailyInspiration.service';

// Controller function to create a new "Create post" entry
const createPost = catchAsync(async (req, res) => {
     // Calling the service to create a new entry
     const result = await DailyInspirationService.createPost(req.body);

     // Sending a success response with the result
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Post created successfully',
          data: result,
     });
});

// Controller function to get all "Create post" entries, with pagination
const getAllCreatePost = catchAsync(async (req, res) => {
     // Fetching all "Create post" entries using query parameters (e.g., for pagination)
     const result = await DailyInspirationService.getAllPost();

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result[0],
     });
});
const getAllCreatePostForAdmin = catchAsync(async (req, res) => {
     // Fetching all "Create post" entries using query parameters (e.g., for pagination)
     const result = await DailyInspirationService.getAllPost();

     // Sending the response with the result and pagination data
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

// Controller function to fetch a specific "Create post" entry by ID
const singlePost = catchAsync(async (req, res) => {
     // Fetching a specific "Create post" entry by ID
     const result = await DailyInspirationService.getSinglePost(req.params.id);

     // Sending the response with the result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Create post" entry
const updatePost = catchAsync(async (req, res) => {
     // Updating the "Create post" entry by ID with the data from the request body
     const result = await DailyInspirationService.updatePost(req.params.id, req.body);

     // Sending the response with the updated result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post updated successfully',
          data: result,
     });
});

// Controller function to delete a "Create post" entry by ID
const deletePost = catchAsync(async (req, res) => {
     // Deleting the "Create post" entry by ID
     const result = await DailyInspirationService.deletePost(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post deleted successfully',
          data: result,
     });
});
const getPost = catchAsync(async (req, res) => {
     // Deleting the "Create post" entry by ID
     const result = await DailyInspirationService.deletePost(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

export const DailyInspirationController = { createPost, getAllCreatePost, singlePost, updatePost, deletePost, getPost, getAllCreatePostForAdmin };
