import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { VideoService } from './video.service';





const getAllVideosByCourse = catchAsync(async (req, res) => {
    const result = await VideoService.getVideosByCourse(req.params.subCategoryId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Videos retrieved successfully',
        data: result.videos,
        meta: result.meta,
    });
});
const markVideoAsCompleted = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await VideoService.markVideoAsCompleted(id, videoId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video mark as complete successfully',
          data: result,
     });
});
const deleteVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await VideoService.deleteVideo(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Video deleted successfully',
        data: result,
    });
});
const updateVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await VideoService.updateVideo(id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Video updated successfully',
        data: result,
    });
});
const updateVideoStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await VideoService.updateVideoStatus(id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Video status updated successfully',
        data: result,
    });
});
export const VideoController = {
    getAllVideosByCourse,
    markVideoAsCompleted
};