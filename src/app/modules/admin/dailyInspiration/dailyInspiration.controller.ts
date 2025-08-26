import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { DailyInspirationService } from './dailyInspiration.service';

// const createPost = catchAsync(async (req, res) => {
//      const result = await DailyInspirationService.createPost(req.body);
//      sendResponse(res, {
//           statusCode: StatusCodes.CREATED,
//           success: true,
//           message: 'Post created successfully',
//           data: result,
//      });
// });
const createPostForSchedule = catchAsync(async (req, res) => {
     const { videoIds, publishAt } = req.body;
     const result = await DailyInspirationService.copyDailyInspirationVideo(videoIds, publishAt);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Post copied successfully',
          data: result,
     });
});

// Controller function to get all "Create post" entries, with pagination
const getAllCreatePost = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.getAllPost();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result[0],
     });
});
const getAllCreatePostForAdmin = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.getPost(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});

// Controller function to fetch a specific "Create post" entry by ID
const singlePost = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.getSinglePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Create post" entry
const updatePost = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.updatePost(req.params.id, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post updated successfully',
          data: result,
     });
});

// Controller function to delete a "Create post" entry by ID
const deletePost = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.deletePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post deleted successfully',
          data: result,
     });
});
const getPost = catchAsync(async (req, res) => {
     const result = await DailyInspirationService.deletePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

export const DailyInspirationController = { getAllCreatePost, singlePost, updatePost, deletePost, getPost, getAllCreatePostForAdmin, createPostForSchedule };
