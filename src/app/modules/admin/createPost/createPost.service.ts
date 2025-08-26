// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ICreatePost } from './createPost.interface';
import { CreatePost } from './createPost.model';

// Function to create a new "create post" entry
const createPost = async (payload: ICreatePost) => {
     const result = await CreatePost.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create create post');
     }
     return result;
};

// Function to fetch all
const getAllPost = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(CreatePost.find({}), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery;

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

const getAllPostForApp = async () => {
     const post = await CreatePost.find({ status: 'active' });
     if (!post) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     return post;
};

const getPost = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(CreatePost.find({ status: 'active' }), query);

     const result = await queryBuilder.fields().sort().paginate().filter().search(['title', 'category', 'subCategory']).modelQuery;

     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

// Function to get the latest "create post" content by ID
const getPostContentLatest = async (id: string) => {
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
     const result = await CreatePost.findById(id);
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
     const isExistVideo = await CreatePost.findById(id);
     if (!isExistVideo) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
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
     const result = await CreatePost.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     return result;
};
const updateStatus = async (id: string, payload: { status: string }) => {
     if (payload.status === 'active') {
          await CreatePost.updateMany(
               { _id: { $ne: id } },
               { status: 'inactive' }
          );
     }
     const result = await CreatePost.findByIdAndUpdate(id, payload, {
          new: true,
     });
     
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'create post not found');
     }
     
     return result;
};
export const CreatePostService = {
     createPost,
     getAllPost,
     getPostContentLatest,
     getSinglePost,
     updatePost,
     deletePost,
     getPost,
     getAllPostForApp,
     updateStatus
};
