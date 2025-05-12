// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ICreatePost } from './creaetPost.interface';
import { CreatePost } from './creaetPost.model';

// Function to create a new "Coming Soon" entry
const createPost = async (payload: ICreatePost) => {
  const result = await CreatePost.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create coming soon');
  }
  return result;
};

// Function to fetch all "Coming Soon" entries, including pagination, filtering, and sorting
const getAllPost = async (query: Record<string, unknown>) => {
  const querBuilder = new QueryBuilder(CreatePost.find({}), query);

  const result = await querBuilder
    .fields()
    .sort()
    .paginate()
    .filter()
    .search(['title', 'category', 'subCategory']).modelQuery; // Final query model

  const meta = await querBuilder.countTotal();
  return { result, meta };
};

// Function to get the latest "Coming Soon" content by ID
const getPostContentLetest = async (id: string) => {
  // Finding the "Coming Soon" entry by its ID
  const result = await CreatePost.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
  }
  return result;
};

// Function to fetch a single "Coming Soon" entry by ID
const getSinglePost = async (id: string) => {
  // Finding a specific "Coming Soon" entry by its ID
  const result = await CreatePost.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
  }
  return result;
};

// Function to update an existing "Coming Soon" entry by ID
const updatePost = async (id: string, payload: Partial<ICreatePost>) => {
  // Finding the "Coming Soon" entry by its ID and updating it with the new data (payload)
  const result = await CreatePost.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
  }
  return result;
};

// Function to delete a "Coming Soon" entry by ID
const deletePost = async (id: string) => {
  // Finding the "Coming Soon" entry by its ID and deleting it
  const result = await CreatePost.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Coming soon not found');
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
};
