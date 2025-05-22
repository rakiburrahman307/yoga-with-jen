import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { videoManagementService } from './videoManagement.service';
// get all videos
const getAllVideos = catchAsync(async (req, res) => {
     const result = await videoManagementService.getVideos(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos retrived successfuly',
          data: result.videos,
          pagination: result.meta,
     });
});
// get all videos
const getSingleVideo = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await videoManagementService.getSingleVideoFromDb(req.params.id, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos retrived successfuly',
          data: result,
     });
});
// get all videos
const getSingleVideoForAdmin = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await videoManagementService.getSingleVideoForAdmin(req.params.id, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos retrived successfuly',
          data: result,
     });
});
// add videos
const addVideos = catchAsync(async (req, res) => {
     const result = await videoManagementService.addVideo(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video uploaded successfuly',
          data: result,
     });
});
// update videos
const updateVideos = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await videoManagementService.updateVideo(id, req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos updated successfuly',
          data: result,
     });
});
// status change videos
const statusChange = catchAsync(async (req, res) => {
     const { id } = req.params;
     const { status } = req.body;
     const result = await videoManagementService.statusChangeVideo(id, status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos status changes successfuly',
     });
});
const removeVideos = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await videoManagementService.removeVideo(id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos deleted successfuly',
     });
});
const markVideoAsCompleted = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await videoManagementService.markVideoAsCompleted(id, videoId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video mark as complete successfully',
          data: result,
     });
});
///////////////////////////////////////////////////////
const postComment = catchAsync(async (req, res) => {
     const { videoId } = req.params;
     const { id }: any = req.user;
     const { content } = req.body;
     const updated = await videoManagementService.addComment(videoId, id, content);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment post successfully',
          data: updated,
     });
});
const postReply = catchAsync(async (req, res) => {
     const { videoId, commentId } = req.params;
     const { id }: any = req.user;
     const { content } = req.body;
     const updated = await videoManagementService.addReply(videoId, commentId, id, content);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment replay successfully',
          data: updated,
     });
});
const likeVideoComment = catchAsync(async (req, res) => {
     const { videoId, commentId } = req.params;
     const { id }: any = req.user;
     const result = await videoManagementService.likeComment(videoId, commentId, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment like successfully',
          data: result,
     });
});
const likeVideoReply = catchAsync(async (req, res) => {
     const { videoId, commentId, replyId } = req.params;
     const { id }: any = req.user;
     const result = await videoManagementService.likeReply(videoId, commentId, replyId, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment replay like successfully',
          data: result,
     });
});
const unlikeVideoComment = catchAsync(async (req, res) => {
     const { videoId, commentId } = req.params;
     const { id }: any = req.user;
     const result = await videoManagementService.unlikeComment(videoId, commentId, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment unlike successfully',
          data: result,
     });
});
const unlikeVideoReply = catchAsync(async (req, res) => {
     const { videoId, commentId, replyId } = req.params;
     const { id }: any = req.user;

     const result = await videoManagementService.unlikeReply(videoId, commentId, replyId, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment unlike successfully',
          data: result,
     });
});
const removeComment = catchAsync(async (req, res) => {
     const { videoId, commentId } = req.params;
     const { id }: any = req.user;
     const result = await videoManagementService.deleteComment(videoId, commentId, id);
     if (result.modifiedCount === 0) {
          sendResponse(res, {
               success: true,
               statusCode: StatusCodes.OK,
               message: "You can't delete this comment",
          });
     }
     console.log(result);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comment deleted successfully',
          data: result,
     });
});
const removeReply = catchAsync(async (req, res) => {
     const { videoId, commentId, replyId } = req.params;
     const { id }: any = req.user;
     const result = await videoManagementService.deleteReply(videoId, commentId, replyId, id);
     if (result.modifiedCount === 0) {
          sendResponse(res, {
               success: true,
               statusCode: StatusCodes.OK,
               message: "You can't delete this reply.",
          });
     }
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Replay deleted successfully',
          data: result,
     });
});
const getComments = catchAsync(async (req, res) => {
     const { videoId } = req.params;

     const comments = await videoManagementService.getCommentsByVideoId(videoId);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Comments retrieved successfully',
          data: comments,
     });
});

export const videoManagementController = {
     getAllVideos,
     addVideos,
     updateVideos,
     removeVideos,
     statusChange,
     getSingleVideo,
     getSingleVideoForAdmin,
     markVideoAsCompleted,
     postComment,
     postReply,
     likeVideoComment,
     likeVideoReply,
     unlikeVideoComment,
     unlikeVideoReply,
     removeComment,
     removeReply,
     getComments,
};
