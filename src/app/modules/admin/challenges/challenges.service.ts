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
import { DateTime } from 'luxon';

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

                    } catch {
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
     const isExistVideo = await ChallengeVideo.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
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
     // Update challenge video count
     await ChallengeCategory.findByIdAndUpdate(result.challengeId, {
          $inc: { videoCount: -1 },
     });
     return result;
};


const ensureMapFormat = (progress: any): Map<string, string> => {
     if (progress instanceof Map) {
          return progress;
     }

     // Convert Object to Map
     const map = new Map<string, string>();
     if (progress && typeof progress === 'object') {
          Object.entries(progress).forEach(([key, value]) => {
               map.set(key, value as string);
          });
     }
     return map;
};



const getChallengeRelateVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Check if subcategory exists
     const isExistCategory = await ChallengeCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     const queryBuilder = new QueryBuilder(
          ChallengeVideo.find({ challengeId: isExistCategory._id }).sort({ order: 1, serial: 1 }),
          query
     );

     const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const userTimezone = user.timezone || 'UTC';
     const completedVideoIds = user.completedSessions?.map((id: any) => id.toString()) || [];
     const userVideoProgress = ensureMapFormat(user.challengeVideoProgress);


     // ✅ FIXED: Helper function to check if a day has passed since completion
     const canUnlockNextVideo = (completionDate: string): boolean => {
          if (!completionDate) return false;

          const completed = DateTime.fromISO(completionDate);
          const completedInUserTz = completed.setZone(userTimezone);
          const currentInUserTz = DateTime.now().setZone(userTimezone);
          
          // Check if it's a different day
          return !completedInUserTz.hasSame(currentInUserTz, 'day');
     };

     // ✅ FIXED: Helper function to calculate next unlock time
     const getNextUnlockTime = (completionDate: string): Date | null => {
          if (!completionDate) return null;

          const completed = DateTime.fromISO(completionDate);
          return completed.setZone(userTimezone).plus({ days: 1 }).startOf('day').toJSDate();
     };

     // 🔥 Find the next video that should unlock tomorrow
     let nextVideoToUnlockIndex = -1;
     let nextVideoUnlockTime: Date | null = null;

     // Calculate which video will unlock next
     for (let i = 0; i < result.length; i++) {
          const videoId = result[i]._id.toString();
          const isCompleted = completedVideoIds.includes(videoId);
          const completionDate = userVideoProgress.get(videoId);

          if (isCompleted && i < result.length - 1) {
               // This video is completed, check next video
               const nextVideoId = result[i + 1]._id.toString();
               const isNextCompleted = completedVideoIds.includes(nextVideoId);

               if (!isNextCompleted && completionDate && !canUnlockNextVideo(completionDate)) {
                    // Next video is not completed and current video was completed today
                    nextVideoToUnlockIndex = i + 1;
                    nextVideoUnlockTime = getNextUnlockTime(completionDate);
                    break;
               }
          }
     }

     // Better logic to find current unlocked index
     let currentUnlockedIndex = 0;
     let allVideosCompleted = completedVideoIds.length === result.length && result.length > 0;

     // Calculate current position and unlock status
     for (let i = 0; i < result.length; i++) {
          const videoId = result[i]._id.toString();
          const isCompleted = completedVideoIds.includes(videoId);
          const completionDate = userVideoProgress.get(videoId);

          if (!isCompleted) {
               currentUnlockedIndex = i;
               break;
          } else if (i === result.length - 1) {
               currentUnlockedIndex = i;
               allVideosCompleted = true;
          } else {
               if (completionDate && canUnlockNextVideo(completionDate)) {
                    currentUnlockedIndex = i + 1;
               } else {
                    currentUnlockedIndex = i;
               }
          }
     }

     // Process videos with optimized logic
     const postsWithStatus = await Promise.all(
          result.map(async (post: any, index: number) => {
               const videoIdString = post._id.toString();
               const isVideoCompleted = completedVideoIds.includes(videoIdString);
               const completionDate = userVideoProgress.get(videoIdString);

               let isEnabled = false;
               let lockReason = '';
               let nextUnlockTime: Date | null = null; // Default: no unlock time

               // 🔥 ONLY show nextUnlockTime for the specific video that unlocks tomorrow
               if (index === nextVideoToUnlockIndex) {
                    nextUnlockTime = nextVideoUnlockTime;
               }

               // Logic for each video
               if (index === 0) {
                    // First video
                    if (!isVideoCompleted) {
                         isEnabled = true;
                         lockReason = '';
                    } else {
                         isEnabled = false;
                         lockReason = 'Video completed';
                    }
               } else {
                    // Other videos
                    const previousVideoId = result[index - 1]._id.toString();
                    const isPreviousCompleted = completedVideoIds.includes(previousVideoId);
                    const previousCompletionDate = userVideoProgress.get(previousVideoId);

                    if (!isPreviousCompleted) {
                         // Previous video not completed
                         isEnabled = false;
                         lockReason = 'Complete previous videos first';
                    } else if (isVideoCompleted) {
                         // This video is completed
                         isEnabled = false;
                         if (index === result.length - 1) {
                              lockReason = allVideosCompleted ? 'Challenge completed' : 'Video completed';
                         } else {
                              lockReason = 'Video completed';
                         }
                    } else {
                         // This video is not completed, check if it should be unlocked
                         if (previousCompletionDate && canUnlockNextVideo(previousCompletionDate)) {
                              // Previous video completed on different calendar day
                              isEnabled = true;
                              lockReason = '';
                         } else {
                              // Previous video completed today - wait for tomorrow
                              isEnabled = false;
                              lockReason = `Video unlocks tomorrow at midnight (${userTimezone})`;
                         }
                    }
               }

               // Special case: if all videos completed, enable last video for replay
               if (allVideosCompleted && index === result.length - 1) {
                    isEnabled = true;
                    lockReason = 'Challenge completed - replay available';
                    nextUnlockTime = null; // No unlock time needed for replay
               }

               return {
                    ...post.toObject(),
                    isVideoCompleted,
                    isEnabled,
                    lockReason,
                    // 🔥 KEY CHANGE: Only include nextUnlockTime for the video that unlocks tomorrow
                    ...(nextUnlockTime && { nextUnlockTime: nextUnlockTime.toISOString() }),
                    completionDate: completionDate || null,
                    canReplay: allVideosCompleted && index === result.length - 1,
                    thumbnailUrl: post.thumbnailUrl || post.thumbnail || null,
                    userTimezone: userTimezone,
               };
          }),
     );

     return {
          result: postsWithStatus,
          meta,
          categoryInfo: {
               ...isExistCategory.toObject(),
               image: isExistCategory.image || null,
          },
          userProgress: {
               totalVideos: result.length,
               completedVideos: completedVideoIds.length,
               currentUnlockedIndex,
               allCompleted: allVideosCompleted,
               nextVideoAvailable: postsWithStatus.some(video => video.isEnabled && !video.isVideoCompleted),
               challengeStatus: allVideosCompleted ? 'completed' : 'in_progress',
               userTimezone: userTimezone,
               // 🔥 Add global next unlock info
               nextUnlockInfo: nextVideoToUnlockIndex !== -1 ? {
                    videoIndex: nextVideoToUnlockIndex,
                    unlockTime: nextVideoUnlockTime?.toISOString(),
                    videoTitle: result[nextVideoToUnlockIndex]?.title
               } : null
          },
     };
};

const markVideoAsCompleted = async (userId: string, videoId: string) => {
     try {
          // Find the user first
          const user = await User.findById(userId);
          if (!user) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
          }

          const userTimezone = user.timezone || 'UTC'; // Default to UTC if no timezone set

          // Convert videoId to ObjectId if using MongoDB ObjectIds
          const videoObjectId = new mongoose.Types.ObjectId(videoId);

          // Check if video is already completed (more reliable comparison)
          const isAlreadyCompleted = user.completedSessions?.some((sessionId: any) =>
               sessionId.toString() === videoId.toString()
          ) || false;

          if (!isAlreadyCompleted) {
               // Find the video to get subcategory info
               const currentVideo = await ChallengeVideo.findById(videoId);
               if (!currentVideo) {
                    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
               }

               // ✅ FIXED: Store completion timestamp (always in UTC for consistency)
               const currentDate = DateTime.now().toISO();

               // ✅ FIXED: Calculate next unlock time in user's timezone
               const nextUnlockDate = DateTime.now().setZone(userTimezone).plus({ days: 1 }).startOf('day').toJSDate();

               // Use findByIdAndUpdate with proper options - ADD DAILY TRACKING
               const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    {
                         $push: { completedSessions: videoObjectId },
                         $set: {
                              [`challengeVideoProgress.${videoId}`]: currentDate
                         }
                    },
                    {
                         new: true, // Return updated document
                         runValidators: true, // Run schema validations
                    },
               );

               if (!updatedUser) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to mark video as completed');
               }

               // Get all videos in this challenge to determine next unlock
               const allChallengeVideos = await ChallengeVideo.find({
                    challengeId: currentVideo.challengeId
               }).sort({ order: 1, serial: 1 });

               // Find current video index
               const currentVideoIndex = allChallengeVideos.findIndex(video =>
                    video._id.toString() === videoId
               );

               let nextVideoInfo: any = {
                    nextVideoUnlocked: false,
                    reason: 'No next video',
                    nextUnlockTime: null
               };

               // Check if there's a next video to unlock
               if (currentVideoIndex !== -1 && currentVideoIndex < allChallengeVideos.length - 1) {
                    const nextVideo = allChallengeVideos[currentVideoIndex + 1];
                    nextVideoInfo = {
                         nextVideoUnlocked: false, // Don't unlock immediately
                         nextVideo: {
                              id: nextVideo._id,
                              name: nextVideo.title
                         },
                         reason: `Next video will unlock at midnight (${userTimezone})`,
                         nextUnlockTime: nextUnlockDate.toISOString(),
                         timeUntilUnlock: calculateTimeUntilUnlock(nextUnlockDate, userTimezone),
                         userTimezone: userTimezone
                    };
               } else if (currentVideoIndex === allChallengeVideos.length - 1) {
                    // Last video completed - challenge finished
                    nextVideoInfo = {
                         nextVideoUnlocked: false,
                         nextVideo: null,
                         reason: 'Challenge completed! All videos finished.',
                         challengeCompleted: true,
                         completionDate: currentDate,
                         userTimezone: userTimezone
                    };
               }

               console.log('Video marked as completed:', {
                    userId,
                    videoId,
                    completedSessions: updatedUser.completedSessions,
                    completionTime: currentDate,
                    userTimezone: userTimezone,
                    nextVideoInfo
               });

               return {
                    success: true,
                    message: `Video completed and locked. Next video unlocks at midnight (${userTimezone}).`,
                    completedSessions: updatedUser.completedSessions,
                    nextVideoInfo: nextVideoInfo,
                    completionTime: currentDate,
                    videoLocked: true, // Video is now locked
                    userTimezone: userTimezone,
               };
          } else {
               // Video already completed - check if next video should be unlocked
               const userProgress = ensureMapFormat(user.challengeVideoProgress);
               const completionDate = userProgress.get(videoId);
               const canUnlockNext = checkIfNextVideoShouldUnlock(completionDate || '', userTimezone);

               return {
                    success: true,
                    message: 'Video already completed',
                    completedSessions: user.completedSessions,
                    nextVideoInfo: {
                         nextVideoUnlocked: canUnlockNext,
                         reason: canUnlockNext ? 'Next video now available' : `Wait until midnight (${userTimezone})`
                    },
                    videoLocked: true,
                    userTimezone: userTimezone,
               };
          }
     } catch (error) {
          console.error('Error marking video as completed:', error);
          throw error;
     }
};

// ✅ FIXED: Helper function to check if next video should unlock (timezone-aware)
const checkIfNextVideoShouldUnlock = (completionDate: string, userTimezone: string): boolean => {
     if (!completionDate) return false;

     const completed = DateTime.fromISO(completionDate);
     const completedInUserTz = completed.setZone(userTimezone);
     const currentInUserTz = DateTime.now().setZone(userTimezone);

     return !completedInUserTz.hasSame(currentInUserTz, 'day');
};

// ✅ FIXED: Helper function to calculate time until next unlock (timezone-aware)
const calculateTimeUntilUnlock = (unlockDate: Date, userTimezone: string): string => {
     const unlockDateTime = DateTime.fromJSDate(unlockDate).setZone(userTimezone);
     const currentDateTime = DateTime.now().setZone(userTimezone);
     
     const diff = unlockDateTime.diff(currentDateTime, ['hours', 'minutes']).toObject();

     if ((diff.hours || 0) <= 0 && (diff.minutes || 0) <= 0) return 'Available now';

     const hours = Math.floor(diff.hours || 0);
     const minutes = Math.floor(diff.minutes || 0);

     if (hours > 0) {
          return `${hours}h ${minutes}m remaining`;
     }
     return `${minutes}m remaining`;
};

const shuffleVideoSerial = async (videoOrder: Array<{ _id: string; serial: number }>) => {
     if (!videoOrder || !Array.isArray(videoOrder) || videoOrder.length === 0) {
          return;
     }
     const updatePromises = videoOrder.map((item) => ChallengeVideo.findByIdAndUpdate(item._id, { serial: item.serial }, { new: true }));
     const result = await Promise.all(updatePromises);
     return result;
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
     shuffleVideoSerial
};
