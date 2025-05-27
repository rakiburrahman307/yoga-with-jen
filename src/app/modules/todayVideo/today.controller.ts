import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TodayVideoService } from './today.service';

const getTodayVideo = catchAsync(async (req, res) => {
    const { id: userId }: any = req.user;
     const result = await TodayVideoService.getTodayRandomVideo(userId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Today video fetched successfully',
          data: result,
     });
});
const getSingleTodayVideo = catchAsync(async (req, res) => {
     const { id: userId }: any = req.user;
     const { id } = req.params;
     const result = await TodayVideoService.getSingleVideoFromDb(id, userId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Today video fetched successfully',
          data: result,
     });
});
export const TodayVideoController = {
     getTodayVideo,
     getSingleTodayVideo,
};
