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

// const getChallengeRelateVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
//      // Check if subcategory exists
//      const isExistCategory = await ChallengeCategory.findById(id);
//      if (!isExistCategory) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
//      }

//      // Get videos sorted by order (add 'order' field to your Video schema)
//      const queryBuilder = new QueryBuilder(ChallengeVideo.find({ challengeId: isExistCategory._id }).sort({ order: 1, serial: 1 }), query);

//      const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
//      const meta = await queryBuilder.countTotal();

//      // Get user data once (more efficient)
//      const user = await User.findById(userId);
//      if (!user) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//      }

//      const completedVideoIds = user.completedSessions?.map((id) => id.toString()) || [];

//      // Check if all videos are completed
//      const allVideosCompleted = result.length > 0 && result.every(video => 
//           completedVideoIds.includes(video._id.toString())
//      );

//      // Find the next video to unlock
//      let nextUnlockedIndex = 0;
     
//      if (allVideosCompleted) {
//           // If all videos completed, stay on the last video
//           nextUnlockedIndex = result.length - 1;
//      } else {
//           // Find the first incomplete video
//           for (let i = 0; i < result.length; i++) {
//                const videoId = result[i]._id.toString();
//                if (!completedVideoIds.includes(videoId)) {
//                     nextUnlockedIndex = i;
//                     break;
//                }
//           }
//      }

//      // Process videos with challenge logic - only one video unlocked at a time
//      const postsWithStatus = await Promise.all(
//           result.map(async (post: any, index: number) => {
//                const videoIdString = post._id.toString();
//                const isVideoCompleted = completedVideoIds.includes(videoIdString);

//                // New logic: Only allow access to the next incomplete video
//                let isEnabled = false;
               
//                if (allVideosCompleted) {
//                     // If all videos completed, only enable the last video
//                     isEnabled = (index === nextUnlockedIndex);
//                } else {
//                     // Normal flow: only enable the next incomplete video
//                     isEnabled = (index === nextUnlockedIndex);
//                }
               
//                return {
//                     ...post.toObject(),
//                     isVideoCompleted,
//                     isEnabled, // Only one video will be enabled at a time
//                };
//           }),
//      );

//      return {
//           result: postsWithStatus,
//           meta,
//      };
// };


const getChallengeRelateVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Check if subcategory exists
     const isExistCategory = await ChallengeCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     // Get videos sorted by order
     const queryBuilder = new QueryBuilder(
          ChallengeVideo.find({ challengeId: isExistCategory._id }).sort({ order: 1, serial: 1 }), 
          query
     );

     const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     // Get user data once (more efficient)
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const completedVideoIds = user.completedSessions?.map((id) => id.toString()) || [];
     const userVideoProgress = user.challengeVideoProgress || {}; // Store completion dates

     const currentDate = new Date();

     // Helper function to check if a day has passed since completion
     const canUnlockNextVideo = (completionDate: string): boolean => {
          if (!completionDate) return false;
          
          const completed = new Date(completionDate);
          const nextDay = new Date(completed);
          nextDay.setDate(nextDay.getDate() + 1);
          
          return currentDate >= nextDay;
     };

     // Find current unlocked video index
     let currentUnlockedIndex = 0;
     let allVideosCompleted = false;

     // Calculate which video should be unlocked
     for (let i = 0; i < result.length; i++) {
          const videoId = result[i]._id.toString();
          const isCompleted = completedVideoIds.includes(videoId);
          
          if (!isCompleted) {
               currentUnlockedIndex = i;
               break;
          } else {
               // Check if enough time has passed to unlock next video
               const completionDate = userVideoProgress.get(videoId);
               if (i === result.length - 1) {
                    // Last video completed
                    allVideosCompleted = true;
                    currentUnlockedIndex = i;
               } else if (completionDate && canUnlockNextVideo(completionDate)) {
                    // Can unlock next video
                    currentUnlockedIndex = i + 1;
               } else {
                    // Must wait for next day
                    currentUnlockedIndex = i;
                    break;
               }
          }
     }

     // Process videos with enhanced challenge logic
     const postsWithStatus = await Promise.all(
          result.map(async (post: any, index: number) => {
               const videoIdString = post._id.toString();
               const isVideoCompleted = completedVideoIds.includes(videoIdString);
               const completionDate = userVideoProgress.get(videoIdString);

               let isEnabled = false;
               let lockReason = '';
               let nextUnlockTime = null;

               if (index === 0) {
                    // First video is always unlocked
                    isEnabled = true;
               } else if (index === currentUnlockedIndex) {
                    // Current video that should be unlocked
                    if (isVideoCompleted) {
                         // Already completed, check if next day has passed
                         if (canUnlockNextVideo(completionDate || '')) {
                              isEnabled = false; // This video is done, next should be unlocked
                              lockReason = 'Video completed';
                         } else {
                              isEnabled = false;
                              lockReason = 'Wait for next day';
                              const completed = new Date(completionDate || ''); // Handle undefined case by providing empty string default
                              nextUnlockTime = new Date(completed);
                              nextUnlockTime.setDate(nextUnlockTime.getDate() + 1);
                         }
                    } else {
                         // Not completed yet, can play
                         isEnabled = true;
                    }
               } else if (index < currentUnlockedIndex) {
                    // Previous videos - completed but locked
                    isEnabled = false;
                    lockReason = 'Video completed';
               } else {
                    // Future videos - locked
                    isEnabled = false;
                    lockReason = 'Complete previous videos first';
               }

               // Special case: if all videos completed, enable last video for replay
               if (allVideosCompleted && index === result.length - 1) {
                    isEnabled = true;
                    lockReason = '';
               }

               return {
                    ...post.toObject(),
                    isVideoCompleted,
                    isEnabled,
                    lockReason,
                    nextUnlockTime,
                    completionDate: completionDate || null,
                    canReplay: allVideosCompleted && index === result.length - 1,
                    // Add thumbnail URL for consistent display
                    thumbnailUrl: post.thumbnailUrl || post.thumbnail || null,
               };
          }),
     );

     return {
          result: postsWithStatus,
          meta,
          categoryInfo: {
               ...isExistCategory.toObject(),
               // Ensure thumbnail is available for the next screen
               image: isExistCategory.image || isExistCategory.image || null,
          },
          userProgress: {
               totalVideos: result.length,
               completedVideos: completedVideoIds.length,
               currentUnlockedIndex,
               allCompleted: allVideosCompleted,
               challengeStatus: allVideosCompleted ? 'completed' : 'in_progress'
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

               // Store completion timestamp for daily unlock logic
               const currentDate = new Date().toISOString();
               const nextUnlockDate = new Date();
               nextUnlockDate.setDate(nextUnlockDate.getDate() + 1); // Next day

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
                         nextVideoUnlocked: false, // Changed: Don't unlock immediately
                         nextVideo: {
                              id: nextVideo._id,
                              name: nextVideo.title
                         },
                         reason: 'Next video will unlock tomorrow',
                         nextUnlockTime: nextUnlockDate.toISOString(),
                         timeUntilUnlock: calculateTimeUntilUnlock(nextUnlockDate)
                    };
               } else if (currentVideoIndex === allChallengeVideos.length - 1) {
                    // Last video completed - challenge finished
                    nextVideoInfo = {
                         nextVideoUnlocked: false,
                         nextVideo: null,
                         reason: 'Challenge completed! All videos finished.',
                         challengeCompleted: true,
                         completionDate: currentDate
                    };
               }

               console.log('Video marked as completed:', {
                    userId,
                    videoId,
                    completedSessions: updatedUser.completedSessions,
                    completionTime: currentDate,
                    nextVideoInfo
               });

               return {
                    success: true,
                    message: 'Video completed and locked. Next video unlocks tomorrow.',
                    completedSessions: updatedUser.completedSessions,
                    nextVideoInfo: nextVideoInfo,
                    completionTime: currentDate,
                    videoLocked: true, // Video is now locked
               };
          } else {
               // Video already completed - check if next video should be unlocked
               const userProgress = user.challengeVideoProgress || {};
               const completionDate = userProgress.get(videoId);
               const canUnlockNext = checkIfNextVideoShouldUnlock(completionDate || '');

               return {
                    success: true,
                    message: 'Video already completed',
                    completedSessions: user.completedSessions,
                    nextVideoInfo: { 
                         nextVideoUnlocked: canUnlockNext, 
                         reason: canUnlockNext ? 'Next video now available' : 'Wait for tomorrow'
                    },
                    videoLocked: true,
               };
          }
     } catch (error) {
          console.error('Error marking video as completed:', error);
          throw error;
     }
};

// Helper function to check if next video should unlock
const checkIfNextVideoShouldUnlock = (completionDate: string): boolean => {
     if (!completionDate) return false;
     
     const completed = new Date(completionDate);
     const nextDay = new Date(completed);
     nextDay.setDate(nextDay.getDate() + 1);
     const now = new Date();
     
     return now >= nextDay;
};

// Helper function to calculate time until next unlock
const calculateTimeUntilUnlock = (unlockDate: Date): string => {
     const now = new Date();
     const diffMs = unlockDate.getTime() - now.getTime();
     
     if (diffMs <= 0) return 'Available now';
     
     const hours = Math.floor(diffMs / (1000 * 60 * 60));
     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
     
     if (hours > 0) {
          return `${hours}h ${minutes}m remaining`;
     }
     return `${minutes}m remaining`;
};



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
//                // Find the video to get subcategory info
//                const currentVideo = await ChallengeVideo.findById(videoId);
//                if (!currentVideo) {
//                     throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
//                }

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

//                // Get all videos in this challenge to determine next unlock
//                const allChallengeVideos = await ChallengeVideo.find({ challengeId: currentVideo.challengeId }).sort({ order: 1, serial: 1 });
               
//                // Find current video index
//                const currentVideoIndex = allChallengeVideos.findIndex(video => video._id.toString() === videoId);
               
//                let nextVideoInfo: any = { nextVideoUnlocked: false, reason: 'No next video' };
               
//                // Check if there's a next video to unlock
//                if (currentVideoIndex !== -1 && currentVideoIndex < allChallengeVideos.length - 1) {
//                     const nextVideo = allChallengeVideos[currentVideoIndex + 1];
//                     nextVideoInfo = {
//                          nextVideoUnlocked: true,
//                          nextVideo: {
//                               id: nextVideo._id,
//                               name: nextVideo.title
//                          },
//                          reason: 'Next video in challenge unlocked'
//                     };
//                } else if (currentVideoIndex === allChallengeVideos.length - 1) {
//                     // If this was the last video, cycle back to first
//                     nextVideoInfo = {
//                          nextVideoUnlocked: true,
//                          nextVideo: {
//                               id: allChallengeVideos[0]._id,
//                               name: allChallengeVideos[0].title
//                          },
//                          reason: 'Challenge completed - cycling back to first video'
//                     };
//                }

//                console.log('Video marked as completed:', {
//                     userId,
//                     videoId,
//                     completedSessions: updatedUser.completedSessions,
//                     nextVideoInfo
//                });

//                return {
//                     success: true,
//                     message: 'Video marked as completed and locked. Next video unlocked.',
//                     completedSessions: updatedUser.completedSessions,
//                     nextVideoInfo: nextVideoInfo,
//                };
//           } else {
//                return {
//                     success: true,
//                     message: 'Video already completed',
//                     completedSessions: user.completedSessions,
//                     nextVideoInfo: { nextVideoUnlocked: false, reason: 'Already completed' },
//                };
//           }
//      } catch (error) {
//           console.error('Error marking video as completed:', error);
//           throw error;
//      }
// };

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
