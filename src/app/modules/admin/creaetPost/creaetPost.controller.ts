// Importing necessary utilities and dependencies
import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { CreaetPostService } from './creaetPost.service';


// Controller function to create a new "Coming Soon" entry
const createPost = catchAsync(async (req, res) => {
  // Calling the service to create a new entry
  const result = await CreaetPostService.createPost(req.body);

  // Sending a success response with the result
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Coming Soon created successfully',
    data: result,
  });
});

// Controller function to get all "Coming Soon" entries, with pagination
const getAllCreatePost = catchAsync(async (req, res) => {
  // Fetching all "Coming Soon" entries using query parameters (e.g., for pagination)
  const result = await CreaetPostService.getAllPost(req.query);

  // Sending the response with the result and pagination data
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coming Soon retrieved successfully',
    data: result.result,
    pagination: result.meta,
  });
});



// Controller function to fetch a specific "Coming Soon" entry by ID
const singlePost = catchAsync(async (req, res) => {
  // Fetching a specific "Coming Soon" entry by ID
  const result = await CreaetPostService.getSinglePost(req.params.id);

  // Sending the response with the result
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coming Soon retrieved successfully',
    data: result,
  });
});

// Controller function to update a "Coming Soon" entry
const updatePost = catchAsync(async (req, res) => {
  // Updating the "Coming Soon" entry by ID with the data from the request body
  const result = await CreaetPostService.updatePost(
    req.params.id,
    req.body,
  );

  // Sending the response with the updated result
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coming Soon updated successfully',
    data: result,
  });
});

// Controller function to delete a "Coming Soon" entry by ID
const deletePost= catchAsync(async (req, res) => {
  // Deleting the "Coming Soon" entry by ID
  const result = await CreaetPostService.deletePost(req.params.id);

  // Sending the response after successful deletion
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Coming Soon deleted successfully',
    data: result,
  });
});


export const CreaetPostController = {
  createPost,
  getAllCreatePost,
  singlePost,
  updatePost,
  deletePost,
};