// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { DailyInspiration } from './dailyInspiration.model';
import { IDailyInspiration, VideoIdInput } from './dailyInspiration.interface';
import { Videos } from '../videos/video.model';
import mongoose from 'mongoose';
import { IVideos } from '../videos/video.interface';


// Function to create a new "create post" entry
// const createPost = async (payload: IDailyInspiration) => {
//      const result = await DailyInspiration.create(payload);
//      if (!result) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create daily inspiration post');
//      }
//      return result;
// };
const copyDailyInspirationVideo = async (
     videoIds: VideoIdInput,
     publishAt?: string
) => {
     try {
          // Convert single videoId to array for uniform processing
          const videoIdArray: (string | mongoose.Types.ObjectId)[] = Array.isArray(videoIds) ? videoIds : [videoIds];

          if (videoIdArray.length === 0) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'No video IDs provided');
          }

          // Process videos in batches for better performance
          const batchSize: number = 15;
          const results_data: IDailyInspiration[] = [];

          for (let i = 0; i < videoIdArray.length; i += batchSize) {
               const batch = videoIdArray.slice(i, i + batchSize);

               // Fetch all videos in current batch
               const videosPromises: Promise<IVideos | null>[] = batch.map(
                    (videoId: string | mongoose.Types.ObjectId) => Videos.findById(videoId)
               );
               const videos: (IVideos | null)[] = await Promise.all(videosPromises);

               const newDailyInspirationData: IDailyInspiration[] = [];
               const validVideos: (string | mongoose.Types.ObjectId)[] = [];

               videos.forEach((video: IVideos | null, index: number) => {
                    if (video) {
                         // Build new daily inspiration object
                         const newDailyInspirationVideoData: any = {
                              title: video.title,
                              duration: video.duration,
                              equipment: video.equipment,
                              thumbnailUrl: video.thumbnailUrl,
                              videoUrl: video.videoUrl,
                              description: video.description,
                              publishAt: publishAt ? new Date(publishAt) : new Date(),
                              status: 'inactive'
                         };

                         newDailyInspirationData.push(newDailyInspirationVideoData);
                         validVideos.push(batch[index]);
                    }
               });

               if (newDailyInspirationData.length > 0) {
                    try {
                         // Bulk insert for better performance
                         const savedDailyInspirationVideos: IDailyInspiration[] = await DailyInspiration.insertMany(
                              newDailyInspirationData,
                              { ordered: false }
                         );

                         results_data.push(...savedDailyInspirationVideos);

                    } catch {
                         throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create daily inspiration post(s)');
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
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create daily inspiration post(s)');
     }
};

// Function to fetch all "create post" entries, including pagination, filtering, and sorting
const getAllPost = async () => {
     const result = await DailyInspiration.find({ status: 'active' });
     if (!result) {
          return [];
     }
     return result;
};

const getPost = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(DailyInspiration.find({}), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create post" content by ID
const getPostContentLatest = async (id: string) => {
     const result = await DailyInspiration.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     const data = {
          ...result.toObject(),
     };
     return data;
};

// Function to fetch a single "create post" entry by ID
const getSinglePost = async (id: string) => {
     const result = await DailyInspiration.findById(id);

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     const data = {
          ...result.toObject(),
     };

     return data;
};

// Function to update an existing "create post" entry by ID
const updatePost = async (id: string, payload: Partial<IDailyInspiration>) => {
     const isExistVideo = await DailyInspiration.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     const result = await DailyInspiration.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     return result;
};

// Function to delete a "create post" entry by ID
const deletePost = async (id: string) => {
     const result = await DailyInspiration.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     return result;
};

export const DailyInspirationService = { copyDailyInspirationVideo, getAllPost, getPostContentLatest, getSinglePost, updatePost, deletePost, getPost };
