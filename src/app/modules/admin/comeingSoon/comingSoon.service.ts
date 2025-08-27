// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { IComingSoon } from './comingSoon.interface';
import { ComingSoon } from './comingSoon.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Favorite } from '../../favorite/favorite.model';
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favorite.findOne({ videoId, userId });
     return favorite ? true : false;
};
// Function to create a new "Coming Soon" entry
const createComingSoon = async (payload: IComingSoon) => {
     const deleteAll = await ComingSoon.deleteMany({});
     if (!deleteAll) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete all coming soon');
     }
     const result = await ComingSoon.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create coming soon');
     }
     return result;
};

// Function to fetch all "Coming Soon" entries, including pagination, filtering, and sorting
const getAllComingSoon = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ComingSoon.find({}), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery;

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "Coming Soon" content by ID
const getComingSoonContentLatest = async (id: string, userId: string) => {
     const result = await ComingSoon.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const isFavorite = await getFevVideosOrNot(id, userId);
     const data = {
          ...result.toObject(),
          isFavorite,
     };
     return data;
};

// Function to fetch a single "Coming Soon" entry by ID
const getSingleComingSoon = async (id: string) => {

     const result = await ComingSoon.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const data = {
          ...result.toObject(),
     };
     return data;
};

// Function to update an existing "Coming Soon" entry by ID
const updateComingSoon = async (id: string, payload: Partial<IComingSoon>) => {
     const isExistVideo = await ComingSoon.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     // if (payload.videoUrl && isExistVideo.videoUrl) {
     //      try {
     //           await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);
     //      } catch {
     //           throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old video from BunnyCDN');
     //      }
     // }

     // if (payload.thumbnailUrl && isExistVideo.thumbnailUrl) {
     //      try {
     //           await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
     //      } catch {
     //           throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting old thumbnail from BunnyCDN');
     //      }
     // }
     // Finding the "Coming Soon" entry by its ID and updating it with the new data (payload)
     const result = await ComingSoon.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     return result;
};

// Function to delete a "Coming Soon" entry by ID
const deleteComingSoon = async (id: string) => {
     const result = await ComingSoon.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     return result;
};

// Function to get the latest "Coming Soon" content (limited to 3 entries)
const getComingSoonLatest = async (userId: string) => {
     const result = await ComingSoon.find().sort({ createdAt: -1 }).limit(3);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     const postsWithFavorites = await Promise.all(
          result.map(async (post: any) => {
               const isFavorite = await getFevVideosOrNot(post._id, userId);
               return {
                    ...post.toObject(),
                    isFavorite,
               };
          }),
     );
     return postsWithFavorites;
};
const updateIsReady = async (id: string, payload: { isReady: 'arrived' | 'ready' }) => {
     const result = await ComingSoon.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
     }
     return result;
};

export const ComingSoonService = {
     createComingSoon,
     getAllComingSoon,
     getComingSoonLatest,
     getComingSoonContentLatest,
     updateComingSoon,
     getSingleComingSoon,
     deleteComingSoon,
     updateIsReady
};
