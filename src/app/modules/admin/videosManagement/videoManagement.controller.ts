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
export const videoManagementController = {
  getAllVideos,
  addVideos,
  updateVideos,
  removeVideos,
  statusChange,
};
