// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ICreatePost } from './creaetPost.interface';
import { CreatePost } from './creaetPost.model';
import config from '../../../../config';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';

// Function to create a new "create post" entry
const createPost = async (payload: ICreatePost) => {
     const deleteAll = await CreatePost.deleteMany({});
     if (!deleteAll) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete all create post');
     }
     const result = await CreatePost.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create create post');
     }
     return result;
};

// Function to fetch all "create post" entries, including pagination, filtering, and sorting
const getAllPost = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(CreatePost.find({}), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};
const getAllPostForApp = async () => {
     const psot = await CreatePost.find({});
     if (!psot) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }

     return psot;
};
const getPost = async (query: Record<string, unknown>) => {
     const querBuilder = new QueryBuilder(CreatePost.find({ status: 'active' }), query);

     const result = await querBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery; // Final query model

     const meta = await querBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create post" content by ID
const getPostContentLetest = async (id: string) => {
     // Finding the "create post" entry by its ID
     const result = await CreatePost.findById(id);
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
     // Finding a specific "create post" entry by its ID
     const result = await CreatePost.findById(id);
     // Decrypt the URL

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }

     const data = {
          ...result.toObject(),
     };

     return data;
};

// Function to update an existing "create post" entry by ID
const updatePost = async (id: string, payload: Partial<ICreatePost>) => {
     // Finding the "create post" entry by its ID and updating it with the new data (payload)
     const isExistVideo = await CreatePost.findById(id);
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
     const result = await CreatePost.findByIdAndUpdate(id, payload, {
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
     const result = await CreatePost.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
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

export const CreaetPostService = {
     createPost,
     getAllPost,
     getPostContentLetest,
     getSinglePost,
     updatePost,
     deletePost,
     getPost,
     getAllPostForApp,
};
