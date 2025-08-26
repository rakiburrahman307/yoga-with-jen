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
          message: 'Videos retrieved successfully',
          data: result.videos,
          pagination: result.meta,
     });
});


// get all videos
const getSingleVideoForAdmin = catchAsync(async (req, res) => {
     const result = await videoManagementService.getSingleVideoForAdmin(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos retrieved successfully',
          data: result,
     });
});
// add videos
const addVideos = catchAsync(async (req, res) => {
     const result = await videoManagementService.addVideo(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video uploaded successfully',
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
          message: 'Videos updated successfully',
          data: result,
     });
});
// status change videos
const statusChange = catchAsync(async (req, res) => {
     const { id } = req.params;
     const { status } = req.body;
     await videoManagementService.statusChangeVideo(id, status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos status changes successfully',
     });
});
const removeVideos = catchAsync(async (req, res) => {
     const { id } = req.params;
     await videoManagementService.removeVideo(id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos deleted successfully',
          data: {}
     });
});

const copyVideo = catchAsync(async (req, res) => {
     const { videoIds, categoryId, subCategoryId } = req.body;
     const result = await videoManagementService.copyVideo(videoIds, categoryId, subCategoryId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video copy successfully',
          data: result,
     });
});
export const videoManagementController = {
     getAllVideos,
     addVideos,
     updateVideos,
     removeVideos,
     statusChange,
     getSingleVideoForAdmin,
     copyVideo,
};
