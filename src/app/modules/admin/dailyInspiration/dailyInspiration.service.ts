// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { decryptUrl } from '../../../../utils/cryptoToken';
import config from '../../../../config';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { DailyInspiration } from './dailyInspiration.model';
import { IDailyInspiration } from './dailyInspiration.interface';

// Function to create a new "create post" entry
const createPost = async (payload: IDailyInspiration) => {
     const result = await DailyInspiration.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create create post');
     }
     return result;
};

// Function to fetch all "create post" entries, including pagination, filtering, and sorting
const getAllPost = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(DailyInspiration.find({}), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};
const getPost = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(DailyInspiration.find({ status: 'active' }), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create post" content by ID
const getPostContentLetest = async (id: string) => {
     // Finding the "create post" entry by its ID
     const result = await DailyInspiration.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     const decryptedUrl = decryptUrl(result.videoUrl, config.bunnyCDN.bunny_token as string);
     const data = {
          ...result.toObject(),
          videoUrl: decryptedUrl,
     };
     return data;
};

// Function to fetch a single "create post" entry by ID
const getSinglePost = async (id: string) => {
     // Finding a specific "create post" entry by its ID
     const result = await DailyInspiration.findById(id);
     // Decrypt the URL

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     const decryptedUrl = decryptUrl(result.videoUrl, config.bunnyCDN.bunny_token as string);
     const data = {
          ...result.toObject(),
          videoUrl: decryptedUrl,
     };

     return data;
};

// Function to update an existing "create post" entry by ID
const updatePost = async (id: string, payload: Partial<IDailyInspiration>) => {
     // Finding the "create post" entry by its ID and updating it with the new data (payload)
     const isExistVideo = await DailyInspiration.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     const decodedUrl = decryptUrl(isExistVideo.videoUrl, config.bunnyCDN.bunny_token as string);
     if (payload.videoUrl && decodedUrl && isExistVideo.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(decodedUrl);
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
     // Finding the "create post" entry by its ID and deleting it
     const result = await DailyInspiration.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     const decodedUrl = decryptUrl(result.videoUrl, config.bunnyCDN.bunny_token as string);
     if (decodedUrl && result.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(decodedUrl);

               if (result.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(result.thumbnailUrl);
               }
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }
     return result;
};

export const DailyInspirationService = { createPost, getAllPost, getPostContentLetest, getSinglePost, updatePost, deletePost, getPost };
