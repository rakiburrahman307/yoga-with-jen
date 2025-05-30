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
const getAllVideosByCourse = catchAsync(async (req, res) => {
     const result = await videoManagementService.getVideosByCourse(req.params.subCategoryId,req.query);
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


export const videoManagementController = {
     getAllVideos,
     addVideos,
     updateVideos,
     removeVideos,
     statusChange,
     getSingleVideo,
     getSingleVideoForAdmin,
     markVideoAsCompleted,
     getAllVideosByCourse
};
