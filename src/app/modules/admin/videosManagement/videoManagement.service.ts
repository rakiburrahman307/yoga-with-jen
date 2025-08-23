import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IVideo } from './videoManagement.interface';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { Category } from '../../category/category.model';
import { User } from '../../user/user.model';
import mongoose from 'mongoose';
import { Favourite } from '../../favourit/favourit.model';
import { checkNextVideoUnlock } from '../../../../helpers/checkNExtVideoUnlocak';
import { VideoLibrary } from './videoManagement.model';
import { Videos } from '../videos/video.model';

// get videos
const getVideos = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(VideoLibrary.find({}), query);
     const videos = await queryBuilder.fields().filter().paginate().search([]).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          videos,
          meta,
     };
};
const getVideosByCourse = async (id: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(VideoLibrary.find({ subCategoryId: id }).populate('categoryId', 'name').populate('subCategoryId', 'name'), query);
     const videos = await queryBuilder.fields().filter().paginate().search([]).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          videos,
          meta,
     };
};
// upload videos
const addVideo = async (payload: IVideo) => {
     // Create the video document
     const video = await VideoLibrary.create(payload);
     if (!video) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add video');
     }

     return video;
};

// update videos
const updateVideo = async (id: string, payload: Partial<IVideo>) => {
     const isExistVideo = await VideoLibrary.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     if (payload.videoUrl && isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);
          } catch {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old video from BunnyCDN');
          }
     }

     if (payload.thumbnailUrl && isExistVideo.thumbnailUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
          } catch  {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old thumbnail from BunnyCDN');
          }
     }
     const result = await VideoLibrary.findByIdAndUpdate(id, payload, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update video');
     }
     return result;
};

// change video status
const statusChangeVideo = async (id: string, status: string) => {
     const result = await VideoLibrary.findByIdAndUpdate(id, { $set: { status } }, { new: true });
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
     const isExistVideo = await VideoLibrary.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     // Delete video and thumbnail from BunnyCDN
     if (isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);

               if (isExistVideo.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
               }
          } catch {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }
     // Delete the video
     const result = await VideoLibrary.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete video');
     }

     return result;
};
const getSingleVideoFromDb = async (id: string, userId: string) => {
     const result = await VideoLibrary.findById(id).populate('categoryId', 'name').populate('subCategoryId', 'name');
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
const getSingleVideoForAdmin = async (id: string) => {
     const result = await VideoLibrary.findById(id);
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
// const markVideoAsCompleted = async (userId: string, videoId: string) => {
//      try {
//           // Find the user first
//           const user = await User.findById(userId);
//           if (!user) {
//                throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//           }

//           // Convert videoId to ObjectId if using MongoDB ObjectIds
//           const videoObjectId = new mongoose.Types.ObjectId(videoId);

//           // Check if video is already completed (more reliable comparison)
//           const isAlreadyCompleted = user.completedSessions.some((sessionId) => sessionId.toString() === videoId.toString());

//           if (!isAlreadyCompleted) {
//                // Use findByIdAndUpdate with proper options
//                const updatedUser = await User.findByIdAndUpdate(
//                     userId,
//                     { $push: { completedSessions: videoObjectId } },
//                     {
//                          new: true, // Return updated document
//                          runValidators: true, // Run schema validations
//                     },
//                );

//                if (!updatedUser) {
//                     throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to mark video as completed');
//                }

//                console.log('Video marked as completed:', {
//                     userId,
//                     videoId,
//                     completedSessions: updatedUser.completedSessions,
//                });

//                return {
//                     success: true,
//                     message: 'Video marked as completed',
//                     completedSessions: updatedUser.completedSessions,
//                };
//           } else {
//                return {
//                     success: true,
//                     message: 'Video already completed',
//                     completedSessions: user.completedSessions,
//                };
//           }
//      } catch (error) {
//           console.error('Error marking video as completed:', error);
//           throw error;
//      }
// };
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
               // Find the video to get subcategory info
               const currentVideo = await Videos.findById(videoId);
               if (!currentVideo) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
               }

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

               // Check what gets unlocked next
               const nextVideoInfo = await checkNextVideoUnlock(userId, currentVideo?.subCategoryId.toString(), videoId);

               console.log('Video marked as completed:', {
                    userId,
                    videoId,
                    completedSessions: updatedUser.completedSessions,
               });

               return {
                    success: true,
                    message: 'Video marked as completed',
                    completedSessions: updatedUser.completedSessions,
                    nextVideoInfo: nextVideoInfo,
               };
          } else {
               return {
                    success: true,
                    message: 'Video already completed',
                    completedSessions: user.completedSessions,
                    nextVideoInfo: { nextVideoUnlocked: false, reason: 'Already completed' },
               };
          }
     } catch (error) {
          console.error('Error marking video as completed:', error);
          throw error;
     }
};

const copyVideo = async (videoId: string, categoryId: string, subCategoryId: string) => {
     // Fetch the original video by ID
     const video = await VideoLibrary.findById(videoId);
     if (!video) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     let categoryName = '';
     // If a categoryId is provided, fetch the category
     if (categoryId) {
          const category = await Category.findById(categoryId);
          if (!category) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
          }
          categoryName = category.name; // Assuming the category has a 'name' field
     }

     // Create a new video object based on the original video
     const videoData = video.toObject();

     // Remove _id and __v fields to avoid duplicate key errors
     const { _id, __v, ...videoDataWithoutId } = videoData;

     const newVideo = new Videos({
          ...videoDataWithoutId,
          categoryId,
          category: categoryName, // Set the category name
     });
     try {
          // Decrease video count in category
          await Category.findByIdAndUpdate(categoryId, {
               $inc: { videoCount: 1 },
          });

          // // Also decrease count in subcategory if video belongs to one
          // if (isExistVideo.subCategoryId) {
          //      await SubCategory.findByIdAndUpdate(isExistVideo.subCategoryId, {
          //           $inc: { videoCount: -1 },
          //      });
          // }
     } catch (error) {
          console.log('Error in decrease video count in category', error);
     }

     // Save the new video to the database
     await newVideo.save();
     return newVideo;
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
     copyVideo,
};
