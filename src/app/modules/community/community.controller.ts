import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommunityService } from './community.service';
// create post
const createPost = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { content } = req.body;
  const newPost = await CommunityService.createPostToDb(id, content);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Post created successfully',
    data: newPost,
  });
});
// get single post
const getPost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommunityService.getPostById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});
// get single post
const getAllPost = catchAsync(async (req, res) => {
  const result = await CommunityService.getAllPosts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});
// get soecific user post
const getSpecificUserPost = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await CommunityService.getSpecificUserPost(id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});
// edit post
const editPost = catchAsync(async (req, res) => {
  const { id } = req.user;
  const postId = req.params.id;
  const { content } = req.body;
  const result = await CommunityService.editPost(postId, content, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post update successfully',
    data: result,
  });
});
// like post
const likedPost = catchAsync(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;
  const result = await CommunityService.likePost(postId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Liked comments successfully',
    data: result,
  });
});
// delete post
const deletePost = catchAsync(async (req, res) => {
  const { id } = req.user;
  const postId = req.params.id;
  await CommunityService.deletePost(postId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post deleted successfully',
  });
});
export const CommunityController = {
  createPost,
  getPost,
  editPost,
  deletePost,
  likedPost,
  getAllPost,
};
