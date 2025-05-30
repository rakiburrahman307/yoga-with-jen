// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { Challenge } from './challanges.model';
import { IChallenge } from './challanges.interface';

// Function to create a new "create Challenge" entry
const createChallenge = async (payload: IChallenge) => {
     const deletedData = await Challenge.deleteMany({});
     if (!deletedData) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete all create Challenge');
     }
     const result = await Challenge.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create create Challenge');
     }
     return result;
};

// Function to fetch all "create Challenge" entries, including pagination, filtering, and sorting
const getAllChallenge = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(Challenge.find({}), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};
const getChallenge = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(Challenge.find({ status: 'active' }), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create Challenge" content by ID
const getChallengeContentLetest = async (id: string) => {
     // Finding the "create Challenge" entry by its ID
     const result = await Challenge.findById(id);
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
     const result = await Challenge.findById(id);
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
     const isExistVideo = await Challenge.findById(id);
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
     const result = await Challenge.findByIdAndUpdate(id, payload, {
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
     const result = await Challenge.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     if (result.videoUrl) {
          try {
               await BunnyStorageHandeler.deleteFromBunny(result.videoUrl);

               if (result.thumbnailUrl) {
                    await BunnyStorageHandeler.deleteFromBunny(result.thumbnailUrl);
               }
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting video from BunnyCDN');
          }
     }
     return result;
};

export const ChallengeService = { createChallenge, getAllChallenge, getChallengeContentLetest, getSingleChallenge, updateChallenge, deleteChallenge, getChallenge };
