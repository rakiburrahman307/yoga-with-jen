import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { videoManagementService } from './videoManagement.service';

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
const addVideos = catchAsync(async (req, res) => {
  const result = await videoManagementService.addVideo();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Videos created successfuly',
  });
});
const updateVideos = catchAsync(async (req, res) => {
  const result = await videoManagementService.updateVideo();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Videos updated successfuly',
  });
});
const blockVideos = catchAsync(async (req, res) => {
  const result = await videoManagementService.blockedVideo();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Videos blocked successfuly',
  });
});
const statusChange = catchAsync(async (req, res) => {
  const result = await videoManagementService.statusChangeVideo();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Videos status changes successfuly',
  });
});
const removeVideos = catchAsync(async (req, res) => {
  const result = await videoManagementService.removeVideo();
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
  blockVideos,
  removeVideos,
  statusChange,
};
