import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommentsService } from './comments.service';

// create comments
const createComment = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { postId, content } = req.body;
     const result = await CommentsService.createCommentToDB(id, postId, content);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Comment created successfully',
          data: result,
     });
});
// get comments
const getComments = catchAsync(async (req, res) => {
     const { postId } = req.params;
     const { id }: any = req.user;
     const result = await CommentsService.getComments(postId, id, req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Comments retrieved successfully',
          data: result.comments,
          pagination: result.meta,
     });
});
// like comments
const likeComment = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { commentId } = req.params;
     const result = await CommentsService.likeComment(commentId, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Liked comments successfully',
          data: result,
     });
});

// reply comments
const replyToComment = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { commentId } = req.params;
     const { content } = req.body;
     const result = await CommentsService.replyToComment(commentId, id, content);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Reply created successfully',
          data: result,
     });
});
// edit comments
const editComment = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { commentId } = req.params;
     const { content } = req.body;
     const result = await CommentsService.editComment(commentId, content, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Comment update successfully',
          data: result,
     });
});
// delete comments
const deleteComment = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { commentId } = req.params;
     await CommentsService.deleteComment(commentId, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Comment deleted successfully',
     });
});

export const CommentsController = {
     createComment,
     getComments,
     replyToComment,
     likeComment,
     editComment,
     deleteComment,
};
