import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ICommunityPost } from './community.interface';
import { Community } from './community.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createPostToDb = async (
  userId: string,
  content: string,
): Promise<ICommunityPost> => {
  const newPost = new Community({
    userId,
    content,
    likes: 0,
    comments: [],
  });

  await newPost.save();
  return newPost;
};
const getPostById = async (postId: string, query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Community.find({ _id: postId })
      // First, populate the post's userId field
      .populate({
        path: 'userId',
        select: 'name email',
      })
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'userId',
            select: 'name email',
          },
          {
            path: 'replies',
            populate: {
              path: 'userId',
              select: 'name email',
            },
          },
        ],
      }),
    query,
  );
  const post = await queryBuilder.paginate().modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { post, meta };
};
export const CommunityService = { createPostToDb, getPostById };
