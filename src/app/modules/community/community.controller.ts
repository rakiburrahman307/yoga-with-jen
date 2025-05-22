import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommunityService } from './community.service';
// create post
const createPost = catchAsync(async (req, res) => {
     const { id }: any = req.user;
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
     const { id: userId }: any = req.user;
     const result = await CommunityService.getPostById(userId, id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});
// get single post
const getAllPost = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await CommunityService.getAllPosts(id, req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post retrieved successfully',
          data: result,
     });
});
// get soecific user post
const getSpecificUserPost = catchAsync(async (req, res) => {
     const { id }: any = req.user;
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
     const { id }: any = req.user;
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
     const { id }: any = req.user;
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
     const { id }: any = req.user;
     const postId = req.params.id;
     await CommunityService.deletePost(postId, id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Post deleted successfully',
     });
});

const leaderBoard = catchAsync(async (req, res) => {
     const result = await CommunityService.getAnalysis();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Analysis retrieved successfully',
          data: result,
     });
});
export const CommunityController = {
     createPost,
     getPost,
     editPost,
     deletePost,
     likedPost,
     getAllPost,
     getSpecificUserPost,
     leaderBoard,
};
