// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { ChallengeVideo } from './challenges.model';
import { IChallenge, IChallengeCategory, VideoIdInput } from './challenges.interface';
import { VideoLibrary } from '../videosManagement/videoManagement.model';
import { ChallengeCategory } from '../challengesCategory/challengesCategory.model';
import { User } from '../../user/user.model';
import mongoose from 'mongoose';
import { checkNextVideoUnlockForChallenge } from '../../../../helpers/checkNExtVideoUnlock';
import { IVideoLibrary } from '../videosManagement/videoManagement.interface';


// Function to create a new "create Challenge" entry
const createChallenge = async (payload: IChallenge) => {
     const isExistCategory = await ChallengeCategory.findById(payload.challengeId);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     payload.challengeName = isExistCategory.name;
     const result = await ChallengeVideo.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create create Challenge');
     }
     return result;
};

const copyChallengeVideo = async (
     videoIds: VideoIdInput,
     challengeCategoryId: string | mongoose.Types.ObjectId,
     publishAt?: string
) => {
     try {
          // Convert single videoId to array for uniform processing
          const videoIdArray: (string | mongoose.Types.ObjectId)[] = Array.isArray(videoIds) ? videoIds : [videoIds];

          if (videoIdArray.length === 0) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No video IDs provided');
          }

          // Fetch challenge category info once (shared for all videos)
          const challengeCategory: IChallengeCategory | null = await ChallengeCategory.findById(challengeCategoryId);

          // Validation
          if (!challengeCategory) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Challenge Category not found');
          }

          // Process videos in batches for better performance
          const batchSize: number = 15;
          const results_data: IChallenge[] = [];

          for (let i = 0; i < videoIdArray.length; i += batchSize) {
               const batch = videoIdArray.slice(i, i + batchSize);

               // Fetch all videos in current batch from VideoLibrary
               const videosPromises: Promise<IVideoLibrary | null>[] = batch.map(
                    (videoId: string | mongoose.Types.ObjectId) => VideoLibrary.findById(videoId)
               );
               const videos: (IVideoLibrary | null)[] = await Promise.all(videosPromises);

               // Prepare new challenge video documents
               const newChallengeVideosData: IChallenge[] = [];
               const validVideos: (string | mongoose.Types.ObjectId)[] = [];

               videos.forEach((video: any | null, index: number) => {
                    if (video) {
                         // Build new challenge video object
                         const newChallengeVideoData: any = {
                              title: video.title,
                              challengeId: challengeCategory._id as mongoose.Types.ObjectId,
                              challengeName: challengeCategory.name,
                              duration: video.duration,
                              equipment: video.equipment,
                              thumbnailUrl: video.thumbnailUrl,
                              videoUrl: video.videoUrl,
                              description: video.description,
                              status: 'inactive',
                              publishAt: publishAt ? new Date(publishAt) : new Date(),
                         };

                         newChallengeVideosData.push(newChallengeVideoData);
                         validVideos.push(batch[index]);
                    }
               });

               if (newChallengeVideosData.length > 0) {
                    try {
                         // Bulk insert for better performance
                         const savedChallengeVideos: any = await ChallengeVideo.insertMany(
                              newChallengeVideosData,
                              { ordered: false }
                         );

                         // Update challenge category video count
                         await ChallengeCategory.findByIdAndUpdate(challengeCategoryId, {
                              $inc: { videoCount: savedChallengeVideos.length }
                         });

                         results_data.push(...savedChallengeVideos);

                    } catch{
                         throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to copy video(s) to challenge');
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
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to copy video(s) to challenge');
     }
};


// const createChallengeForSchedule = async (payload: { publishAt: string; videoId: string; categoryId: string }) => {
//      const { publishAt, videoId, categoryId } = payload;
//      const isExistVideo = await Videos.findById(videoId);
//      if (!isExistVideo) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
//      }
//      const isExistCategory = await ChallengeCategory.findById(categoryId);
//      if (!isExistCategory) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
//      }
//      const data = {
//           title: isExistVideo.title,
//           challengeId: isExistCategory._id.toString(),
//           challengeName: isExistCategory.name,
//           duration: isExistVideo.duration,
//           equipment: isExistVideo.equipment,
//           thumbnailUrl: isExistVideo.thumbnailUrl,
//           videoUrl: isExistVideo.videoUrl,
//           description: isExistVideo.description,
//           status: 'inactive',
//           publishAt,
//      };
//      // Create the new post
//      const result = await ChallengeVideo.create(data);
//      if (!result) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Challenge');
//      }
//      return result;
// };
// Function to fetch all "create Challenge" entries, including pagination, filtering, and sorting
const getAllChallenge = async (id: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ChallengeVideo.find({ challengeId: id }), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

const getChallenge = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ChallengeVideo.find({ status: 'active' }), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create Challenge" content by ID
const getChallengeContentLatest = async (id: string) => {
     // Finding the "create Challenge" entry by its ID
     const result = await ChallengeVideo.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     const data = {
          ...result.toObject(),
     };
     return data;
};

// Function to fetch a single "create Challenge" entry by ID
const getSingleChallenge = async (id: string) => {
     // Finding a specific "create Challenge" entry by its ID
     const result = await ChallengeVideo.findById(id);
     // Decrypt the URL

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }

     const data = {
          ...result.toObject(),
     };

     return data;
};

// Function to update an existing "create Challenge" entry by ID
const updateChallenge = async (id: string, payload: Partial<IChallenge>) => {
     // Finding the "create Challenge" entry by its ID and updating it with the new data (payload)
     const isExistVideo = await ChallengeVideo.findById(id);
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
     const result = await ChallengeVideo.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     return result;
};

// Function to delete a "create Challenge" entry by ID
const deleteChallenge = async (id: string) => {
     // Finding the "create Challenge" entry by its ID and deleting it
     const result = await ChallengeVideo.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     if (result.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(result.videoUrl);

               if (result.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(result.thumbnailUrl);
               }
          } catch {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }
     return result;
};

const getChallengeRelateVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Check if subcategory exists
     const isExistCategory = await ChallengeCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     // Get videos sorted by order (add 'order' field to your Video schema)
     const queryBuilder = new QueryBuilder(ChallengeVideo.find({ challengeId: isExistCategory._id }).sort({ order: 1, serial: 1 }), query);

     const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     // Get user data once (more efficient)
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const completedVideoIds = user.completedSessions?.map((id) => id.toString()) || [];

     // Process videos with sequential logic
     const postsWithStatus = await Promise.all(
          result.map(async (post: any, index: number) => {
               const videoIdString = post._id.toString();

               // Check if current video is completed
               const isVideoCompleted = completedVideoIds.includes(videoIdString);

               // Check if video is enabled (sequential logic)
               let isEnabled = false;
               if (index === 0) {
                    // First video is always enabled
                    isEnabled = true;
               } else {
                    // Check if ALL previous videos are completed (strict sequential)
                    const allPreviousCompleted = result.slice(0, index).every((prevVideo: any) => completedVideoIds.includes(prevVideo._id.toString()));
                    isEnabled = allPreviousCompleted;
               }
               return {
                    ...post.toObject(),
                    isVideoCompleted,
                    isEnabled, // This is the key property for sequential access
               };
          }),
     );

     return {
          result: postsWithStatus,
          meta,
     };
};
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
               const currentVideo = await ChallengeVideo.findById(videoId);
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
               const nextVideoInfo = await checkNextVideoUnlockForChallenge(userId, currentVideo?.challengeId.toString(), videoId);

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
export const ChallengeService = {
     createChallenge,
     getAllChallenge,
     getChallengeContentLatest,
     getSingleChallenge,
     updateChallenge,
     deleteChallenge,
     getChallenge,
     copyChallengeVideo,
     getChallengeRelateVideo,
     markVideoAsCompleted,
};
