import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavouritVideosSevices } from './favourit.service';

const likedVideosOrUnliked = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await FavouritVideosSevices.likedVideos(id, videoId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product liked successfully',
          data: result,
     });
});

const getFavouritVideos = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await FavouritVideosSevices.getAllFavouritList(id, req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Favourit Videos retrieved successfully',
          data: result,
     });
});

const removeLikedVideos = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await FavouritVideosSevices.deleteFavouriteVideos(id, videoId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Videos removed successfully',
          data: result,
     });
});
const getSingleVideo = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await FavouritVideosSevices.getSingleVideoUrl(req.params.id, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Url retrived successfuly',
          data: result,
     });
});
export const FavouritVideosController = {
     likedVideosOrUnliked,
     removeLikedVideos,
     getFavouritVideos,
     getSingleVideo,
};
