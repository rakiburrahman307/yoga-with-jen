import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { Videos } from '../admin/videos/video.model';
import { Favorite } from './favorite.model';

const likedVideos = async (userId: string, videoId: string) => {
     // Start a session for a transaction
     const session = await mongoose.startSession();
     session.startTransaction();
     try {
          const existingLike = await Favorite.findOne({ userId, videoId }).session(session);

          if (existingLike) {
               await Favorite.deleteOne({ userId, videoId }).session(session);

               await session.commitTransaction();
               return { isLiked: false };
          } else {
               const newLike = new Favorite({ userId, videoId });
               await newLike.save({ session });

               await session.commitTransaction();
               return { isLiked: true };
          }
     } catch {
          await session.abortTransaction();
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while processing your like/unlike action');
     } finally {
          session.endSession();
     }
};

const deleteFavoriteVideos = async (userId: string, videoId: string) => {
     const likedVideo = await Favorite.findOne({ userId, videoId });
     if (!likedVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Product not found in favorite');
     }

     const deleteProduct = await Favorite.findByIdAndDelete(likedVideo._id);
     if (!deleteProduct) {
          throw new AppError(StatusCodes.NOT_FOUND, "Favorite  item can't deleted!");
     }
     return deleteProduct;
};

const getAllFavoriteList = async (userId: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Favorite.find({ userId }).populate('videoId', 'thumbnailUrl title duration type description'), query);
     const favoriteList = await queryBuilder.fields().paginate().modelQuery.exec();

     const meta = await queryBuilder.countTotal();
     return { favoriteList, meta };
};
const getSingleVideoUrl = async (id: string, userId: string) => {
     const result = await Videos.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     await User.hasActiveSubscription(userId);

     // if (hasSubscription) {
     //      // If the user has an active subscription or the video is free
     //      const data = {
     //           ...result.toObject(),
     //      };
     //      return data;
     // }
     return result;
};
export const FavoriteVideosServices = {
     likedVideos,
     getAllFavoriteList,
     deleteFavoriteVideos,
     getSingleVideoUrl,
};
