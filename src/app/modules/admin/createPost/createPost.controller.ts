
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync'; 
import sendResponse from '../../../../shared/sendResponse';
import { CreatePostService } from './createPost.service';

// Controller function to create a new "Create post" entry
const createPost = catchAsync(async (req, res) => {
     const result = await CreatePostService.createPost(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Post created successfully',
          data: result,
     });
});

// Controller function to get all "Create post" entries, with pagination
const getAllCreatePost = catchAsync(async (req, res) => {

     const result = await CreatePostService.getAllPost(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});
const getAllCreatePostForApp = catchAsync(async (req, res) => {
     const result = await CreatePostService.getAllPostForApp();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result[0],
     });
});

// Controller function to fetch a specific "Create post" entry by ID
const singlePost = catchAsync(async (req, res) => {
     const result = await CreatePostService.getSinglePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Create post" entry
const updatePost = catchAsync(async (req, res) => {
     const result = await CreatePostService.updatePost(req.params.id, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post updated successfully',
          data: result,
     });
});

// Controller function to delete a "Create post" entry by ID
const deletePost = catchAsync(async (req, res) => {
     const result = await CreatePostService.deletePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post deleted successfully',
          data: result,
     });
});
const getPost = catchAsync(async (req, res) => {
     const result = await CreatePostService.deletePost(req.params.id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});
const updateStatus = catchAsync(async (req, res) => {
     const result = await CreatePostService.updateStatus(req.params.id, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post updated successfully',
          data: result,
     });
});
export const CreatePostController = {
     createPost,
     getAllCreatePost,
     singlePost,
     updatePost,
     deletePost,
     getPost,
     getAllCreatePostForApp,
     updateStatus
};
