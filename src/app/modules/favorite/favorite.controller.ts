import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavoriteVideosServices } from './favorite.service';

const likedVideosOrUnlike = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await FavoriteVideosServices.likedVideos(id, videoId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product liked successfully',
          data: result,
     });
});

const getFavoriteVideos = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await FavoriteVideosServices.getAllFavoriteList(id, req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Favorite Videos retrieved successfully',
          data: result,
     });
});

const removeLikedVideos = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await FavoriteVideosServices.deleteFavoriteVideos(id, videoId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Videos removed successfully',
          data: result,
     });
});
const getSingleVideo = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await FavoriteVideosServices.getSingleVideoUrl(req.params.id, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Url retrieved successfully',
          data: result?.videoUrl,
     });
});
export const FavoriteVideosController = {
     likedVideosOrUnlike,
     removeLikedVideos,
     getFavoriteVideos,
     getSingleVideo,
};
