// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { DailyInspiration } from './dailyInspiration.model';
import { IDailyInspiration } from './dailyInspiration.interface';
import { Videos } from '../videos/video.model';


// Function to create a new "create post" entry
const createPost = async (payload: IDailyInspiration) => {
     const result = await DailyInspiration.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create daily inspiration post');
     }
     return result;
};
const createPostForSchedule = async (payload: { publishAt: string; videoId: string }) => {
     const { publishAt, videoId } = payload;
     const isExistVideo = await Videos.findById(videoId);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     const data = {
          title: isExistVideo.title,
          category: isExistVideo.category,
          duration: isExistVideo.duration,
          equipment: isExistVideo.equipment,
          thumbnailUrl: isExistVideo.thumbnailUrl,
          videoUrl: isExistVideo.videoUrl,
          description: isExistVideo.description,
          publishAt,
     };
     const result = await DailyInspiration.create(data);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create daily inspiration post');
     }
     return result;
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
     if (payload.videoUrl && isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);
          } catch  {
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
     if (result.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(result.videoUrl);

               if (result.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(result.thumbnailUrl);
               }
          } catch{
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }
     return result;
};

export const DailyInspirationService = { createPost, getAllPost, getPostContentLatest, getSinglePost, updatePost, deletePost, getPost, createPostForSchedule };
