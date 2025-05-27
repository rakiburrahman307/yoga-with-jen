import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ExploreService } from './explore.service';

const letestVideos = catchAsync(async (req, res) => {
     const result = await ExploreService.getAllLetestVideos(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Videos retrieved successfully',
          data: result,
     });
});
const getAllCategories = catchAsync(async (req, res) => {
     const result = await ExploreService.getAllCategories(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Categories retrieved successfully',
          data: result,
     });
});

export const ExploreController = {
     getAllCategories,
     letestVideos
};
