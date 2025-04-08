import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ICommunityPost } from './community.interface';
import { Community } from './community.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';
import { Comment } from '../comments/comments.model';
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
const getPostById = async (postId: string) => {
  const result = await Community.findById(postId)
    // First, populate the post's userId field
    .populate({
      path: 'userId',
      select: 'name image createdAt',
    })
    .populate({
      path: 'comments',
      select: 'content likes userId',
      populate: [
        {
          path: 'userId',
          select: 'name image createdAt',
        },
        {
          path: 'replies',
          select: 'content likes userId',
          populate: {
            path: 'userId',
            select: 'name image createdAt',
          },
        },
      ],
    });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found!');
  }
  return result;
};
// edit post
const editPost = async (id: string, payload: string, userId: string) => {
  if (!payload) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Content is required to update the post',
    );
  }
  const isExistPost = await Community.findById(id);
  if (!isExistPost) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // Step 2: Ensure the user is the post creator
  if (isExistPost.userId.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to edit this post',
    );
  }
  const updatePost = await Community.findByIdAndUpdate(
    id,
    { content: payload },
    { new: true },
  );

  if (!updatePost) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Post not found or could not update',
    );
  }

  return updatePost;
};

const deletePost = async (id: string, userId: string) => {
  const isExistPost = await Community.findById(id);
  if (!isExistPost) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // Step 2: Ensure the user is the post creator
  if (isExistPost.userId.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this post',
    );
  }
  for (const commentId of isExistPost.comments) {
    const comment = await Comment.findById(commentId);
    if (comment) {
      if (comment.replies.length > 0) {
        for (const replyId of comment.replies) {
          await Comment.findByIdAndDelete(replyId);
        }
      }
      await Comment.findByIdAndDelete(commentId);
    }
  }

  const deletePost = await Community.findByIdAndDelete(isExistPost._id);
  if (!deletePost) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Cannot delete the post');
  }

  return deletePost;
};

// like comments
const likePost = async (postId: string, userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }
  const updatedComment = await Community.findOneAndUpdate(
    { _id: postId, likedBy: { $ne: userId } },
    {
      $inc: { likes: 1 },
      $push: { likedBy: userId },
    },
    { new: true, runValidators: true },
  );
  if (updatedComment) {
    await sendNotifications({
      receiver: updatedComment.userId,
      message: `User '${user.name}' liked your comment`,
      type: 'MESSAGE',
    });
  }
  if (!updatedComment) {
    const unlikedComment = await Community.findOneAndUpdate(
      { _id: postId, likedBy: { $in: [userId] } },
      {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      },
      { new: true, runValidators: true },
    );

    if (!unlikedComment) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Comment not found or user has not liked it yet',
      );
    }

    return { likes: unlikedComment.likes };
  }

  return { likes: updatedComment.likes };
};
// get all post
const getAllPosts = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Community.find({}), query);

  const posts = await queryBuilder
    .paginate()
    .filter()
    .sort()
    .fields()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    posts,
    meta,
  };
};
// get get Specific User post
const getSpecificUserPost = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(Community.find({ userId }), query);

  const posts = await queryBuilder
    .paginate()
    .filter()
    .sort()
    .fields()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    posts,
    meta,
  };
};
export const CommunityService = {
  createPostToDb,
  getPostById,
  editPost,
  deletePost,
  likePost,
  getAllPosts,
  getSpecificUserPost,
};
