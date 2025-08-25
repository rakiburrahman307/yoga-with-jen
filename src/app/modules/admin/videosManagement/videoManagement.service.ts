import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IVideo, IVideoLibrary, VideoIdInput } from './videoManagement.interface';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { Category } from '../../category/category.model';
import { User } from '../../user/user.model';
import { Types } from 'mongoose';
import { Favorite } from '../../favorite/favorite.model';
import { VideoLibrary } from './videoManagement.model';
import { Videos } from '../videos/video.model';
import { IVideos } from '../videos/video.interface';
import { SubCategory } from '../../subCategorys/subCategory.model';
import { ICategory } from '../../category/category.interface';
import { ISubCategory } from '../../subCategorys/subCategory.interface';


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
          } catch {
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
     const favorite = await Favorite.findOne({ videoId, userId });
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


const copyVideo = async (
     videoIds: VideoIdInput,
     categoryId: string | Types.ObjectId,
     subCategoryId?: string | Types.ObjectId | null
) => {
     try {
          // Convert single videoId to array for uniform processing
          const videoIdArray: (string | Types.ObjectId)[] = Array.isArray(videoIds) ? videoIds : [videoIds];

          if (videoIdArray.length === 0) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No video IDs provided');
          }

          // Fetch category and subcategory info once (shared for all videos)
          const fetchPromises: Promise<ICategory | ISubCategory | null>[] = [];

          if (categoryId) {
               fetchPromises.push(Category.findById(categoryId));
          }

          if (subCategoryId) {
               fetchPromises.push(SubCategory.findById(subCategoryId));
          }

          const results = await Promise.all(fetchPromises);
          const category: ICategory | null = categoryId ? results[0] as ICategory : null;
          const subCategory: ISubCategory | null = subCategoryId ? results[results.length - 1] as ISubCategory : null;

          // Validation
          if (categoryId && !category) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
          }

          if (subCategoryId && !subCategory) {
               throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found');
          }

          // Process videos in batches for better performance
          const batchSize: number = 15;
          const results_data: IVideos[] = [];

          for (let i = 0; i < videoIdArray.length; i += batchSize) {
               const batch = videoIdArray.slice(i, i + batchSize);

               // Fetch all videos in current batch
               const videosPromises: Promise<IVideoLibrary | null>[] = batch.map(
                    (videoId: string | Types.ObjectId) => VideoLibrary.findById(videoId)
               );
               const videos: (IVideoLibrary | null)[] = await Promise.all(videosPromises);

               // Prepare new video documents
               const newVideosData: IVideos[] = [];
               const validVideos: (string | Types.ObjectId)[] = [];

               videos.forEach((video: IVideoLibrary | null, index: number) => {
                    if (video) {
                         const videoData = video.toObject();
                         const { _id, __v, ...videoDataWithoutId } = videoData;

                         // Build new video object dynamically
                         const newVideoData: IVideos = {
                              ...videoDataWithoutId,
                              categoryId: categoryId ? new Types.ObjectId(categoryId) : null,
                              category: category?.name || '',
                         };

                         // Add subcategory data only if provided
                         if (subCategoryId && subCategory) {
                              newVideoData.subCategoryId = new Types.ObjectId(subCategoryId);
                              newVideoData.subCategory = subCategory.name || '';
                              newVideoData.type = subCategory.type || '';
                         }

                         newVideosData.push(newVideoData);
                         validVideos.push(batch[index]);
                    }
               });

               if (newVideosData.length > 0) {
                    try {
                         // Bulk insert for better performance
                         const savedVideos: IVideos[] = await Videos.insertMany(newVideosData, { ordered: false });

                         // Update counts in parallel
                         const countUpdatePromises: Promise<any>[] = [];

                         if (categoryId) {
                              countUpdatePromises.push(
                                   Category.findByIdAndUpdate(categoryId, {
                                        $inc: { videoCount: savedVideos.length }
                                   })
                              );
                         }

                         if (subCategoryId) {
                              countUpdatePromises.push(
                                   SubCategory.findByIdAndUpdate(subCategoryId, {
                                        $inc: { videoCount: savedVideos.length }
                                   })
                              );
                         }

                         await Promise.all(countUpdatePromises);

                         results_data.push(...savedVideos);

                    } catch {
                         throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to copy video(s)');

                    }
               }

               // Add small delay between batches to avoid overwhelming DB
               if (i + batchSize < videoIdArray.length) {
                    await new Promise<void>(resolve => setTimeout(resolve, 50));
               }
          }
          // Return single object if single video was requested
          if (!Array.isArray(videoIds) && results_data.length === 1) {
               return results_data[0];
          }

          return results_data;

     } catch (error: any) {
          // Re-throw AppError instances
          if (error instanceof AppError) {
               throw error;
          }
          // Generic error
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to copy video(s)');
     }
};

export const videoManagementService = {
     getVideos,
     addVideo,
     updateVideo,
     statusChangeVideo,
     removeVideo,
     getSingleVideoFromDb,
     getSingleVideoForAdmin,
     copyVideo,
};
