import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IVideo } from './videoManagement.interface';
import { Video } from './videoManagement.model';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { Category } from '../../category/category.model';
import { User } from '../../user/user.model';
import mongoose from 'mongoose';
import { SubCategory } from '../../subCategorys/subCategory.model';
import { Favourite } from '../../favourit/favourit.model';

// get videos
const getVideos = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Video.find({}).populate('categoryId', 'name').populate('subCategoryId', 'name'), query);
     const videos = await queryBuilder.fields().filter().paginate().search([]).sort().modelQuery.exec();

     const meta = await queryBuilder.countTotal();
     return {
          videos,
          meta,
     };
};
const getVideosByCourse = async (id: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Video.find({ subCategoryId: id }).populate('categoryId', 'name').populate('subCategoryId', 'name'), query);
     const videos = await queryBuilder.fields().filter().paginate().search([]).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          videos,
          meta,
     };
};
// upload videos
const addVideo = async (payload: IVideo) => {
     // Check main category
     const isExistCategory = await Category.findById(payload.categoryId);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     if (isExistCategory.status === 'inactive') {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Category is inactive');
     }

     // Increment videoCount of main category
     const updatedCategory = await Category.findByIdAndUpdate(isExistCategory._id, { $inc: { videoCount: 1 } }, { new: true });
     if (!updatedCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update category!');
     }

     // If subCategory is provided, validate and increment subCategoryCount of subcategory itself (or main category if that's your design)
     if (payload.subCategoryId && payload.categoryId) {
          const isExistSubCategory = await SubCategory.findById(payload.subCategoryId);
          if (!isExistSubCategory) {
               throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found');
          }
          if (isExistSubCategory.status === 'inactive') {
               throw new AppError(StatusCodes.BAD_REQUEST, 'SubCategory is inactive');
          }

          // Here you can update either the subCategory document or the main category document
          // I'm assuming you want to increment the subCategoryCount on the main category:
          const updatedCategoryForSub = await SubCategory.findByIdAndUpdate(isExistSubCategory._id, { $inc: { videoCount: 1 } }, { new: true });
          if (!updatedCategoryForSub) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update category!');
          }
     }

     // Create the video document
     const video = await Video.create(payload);
     if (!video) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add video');
     }

     return video;
};

// update videos
const updateVideo = async (id: string, payload: Partial<IVideo>) => {
     const isExistVideo = await Video.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     if (payload.videoUrl && isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old video from BunnyCDN');
          }
     }

     if (payload.thumbnailUrl && isExistVideo.thumbnailUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old thumbnail from BunnyCDN');
          }
     }
     const result = await Video.findByIdAndUpdate(id, payload, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update video');
     }
     return result;
};

// change video status
const statusChangeVideo = async (id: string, status: string) => {
     const result = await Video.findByIdAndUpdate(id, { $set: { status } }, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to change video status');
     }
     return result;
};
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};
// delete video from bunny cdn and mongodb
const removeVideo = async (id: string) => {
     const isExistVideo = await Video.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     if (isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);

               if (isExistVideo.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
               }
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }

     const result = await Video.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete video');
     }
     return result;
};
const getSingleVideoFromDb = async (id: string, userId: string) => {
     const result = await Video.findById(id).populate('categoryId', 'name').populate('subCategoryId', 'name');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     const hasSubscription = await User.hasActiveSubscription(userId);
     const isFavorite = await getFevVideosOrNot(id, userId);
     if (hasSubscription) {
          // If the user has an active subscription or the video is free
          const data = {
               ...result.toObject(),
               isFavorite,
          };
          return data;
     }

     // If the user doesn't have a subscription and the video is paid
     throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access');
};
const getSingleVideoForAdmin = async (id: string, userId: string) => {
     const result = await Video.findById(id).populate('categoryId', 'name').populate('subCategoryId', 'name');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     // If the user has an active subscription or the video is free
     const data = {
          ...result.toObject(),
     };
     return data;
};
// Mark a video as completed for a user
const markVideoAsCompleted = async (userId: string, videoId: string) => {
     try {
          // Find the user first
          const user = await User.findById(userId);
          if (!user) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
          }

          // Convert videoId to ObjectId if using MongoDB ObjectIds
          const videoObjectId = new mongoose.Types.ObjectId(videoId);

          // Check if video is already completed (more reliable comparison)
          const isAlreadyCompleted = user.completedSessions.some((sessionId) => sessionId.toString() === videoId.toString());

          if (!isAlreadyCompleted) {
               // Use findByIdAndUpdate with proper options
               const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { $push: { completedSessions: videoObjectId } },
                    {
                         new: true, // Return updated document
                         runValidators: true, // Run schema validations
                    },
               );

               if (!updatedUser) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to mark video as completed');
               }

               console.log('Video marked as completed:', {
                    userId,
                    videoId,
                    completedSessions: updatedUser.completedSessions,
               });

               return {
                    success: true,
                    message: 'Video marked as completed',
                    completedSessions: updatedUser.completedSessions,
               };
          } else {
               return {
                    success: true,
                    message: 'Video already completed',
                    completedSessions: user.completedSessions,
               };
          }
     } catch (error) {
          console.error('Error marking video as completed:', error);
          throw error;
     }
};
export const videoManagementService = {
     getVideos,
     addVideo,
     updateVideo,
     statusChangeVideo,
     removeVideo,
     getSingleVideoFromDb,
     markVideoAsCompleted,
     getSingleVideoForAdmin,
     getVideosByCourse,
};
