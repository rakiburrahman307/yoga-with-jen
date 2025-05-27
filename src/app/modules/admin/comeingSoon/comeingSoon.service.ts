// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { IComeingSoon } from './comeingSoon.interface';
import { ComeingSoon } from './comeingSoon.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { Favourite } from '../../favourit/favourit.model';
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};
// Function to create a new "Coming Soon" entry
const createComingSoon = async (payload: IComeingSoon) => {
     const deleteAll = await ComeingSoon.deleteMany({});
     if (!deleteAll) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete all coming soon');
     }
     const result = await ComeingSoon.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create coming soon');
     }
     return result;
};

// Function to fetch all "Coming Soon" entries, including pagination, filtering, and sorting
const getAllComingSoon = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(ComeingSoon.find({}), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "Coming Soon" content by ID
const getComingSoonContentLetest = async (id: string, userId: string) => {
     // Finding the "Coming Soon" entry by its ID
     const result = await ComeingSoon.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const isFevorite = await getFevVideosOrNot(id, userId);
     const data = {
          ...result.toObject(),
          isFevorite,
     };
     return data;
};

// Function to fetch a single "Coming Soon" entry by ID
const getSingleComingSoon = async (id: string) => {
     // Finding a specific "Coming Soon" entry by its ID
     const result = await ComeingSoon.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const data = {
          ...result.toObject(),
     };
     return data;
};

// Function to update an existing "Coming Soon" entry by ID
const updateComingSoon = async (id: string, payload: Partial<IComeingSoon>) => {
     const isExistVideo = await ComeingSoon.findById(id);
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
     // Finding the "Coming Soon" entry by its ID and updating it with the new data (payload)
     const result = await ComeingSoon.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     return result;
};

// Function to delete a "Coming Soon" entry by ID
const deleteComingSoon = async (id: string) => {
     // Finding the "Coming Soon" entry by its ID and deleting it
     const result = await ComeingSoon.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     return result;
};

// Function to get the latest "Coming Soon" content (limited to 3 entries)
const getCommingSoonLetest = async (userId: string) => {
     const result = await ComeingSoon.find().sort({ createdAt: -1 }).limit(3);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const postsWithFavorites = await Promise.all(
          result.map(async (post: any) => {
               const isFevorite = await getFevVideosOrNot(post._id, userId);
               return {
                    ...post.toObject(),
                    isFevorite,
               };
          }),
     );
     return postsWithFavorites;
};

// Exporting the service functions to be used in the controller
export const ComeingSoonService = {
     createComingSoon,
     getAllComingSoon,
     getCommingSoonLetest,
     getComingSoonContentLetest,
     updateComingSoon,
     getSingleComingSoon,
     deleteComingSoon,
};
