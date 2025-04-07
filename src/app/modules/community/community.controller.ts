import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommunityService } from './community.service';

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
const getPost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newPost = await CommunityService.getPostById(id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Post created successfully',
    data: newPost,
  });
});
export const CommunityController = { createPost, getPost };
