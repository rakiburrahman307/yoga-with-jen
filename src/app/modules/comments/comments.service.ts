import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Community } from '../community/community.model';
import { Comment } from './comments.model';

// create comment
const createCommentToDB = async (
  userId: string,
  postId: string,
  content: string,
) => {
  if (!content.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Content cannot be empty');
  }

  const newComment = new Comment({
    userId,
    postId,
    content,
    likes: 0,
    replies: [],
  });
  await newComment.save();
  // Add the new comment to the post's comment list
  const result = await Community.findByIdAndUpdate(postId, {
    $push: { comments: newComment._id },
  });
  if (!result) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update parent comment with the new reply',
    );
  }
  return newComment;
};
// get comments
const getComments = async (postId: string, query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Comment.find({ postId }).populate('replies'),
    query,
  );
  const comments = await queryBuilder.paginate().modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { comments, meta };
};
// like comments
const likeComment = async (commentId: string, userId: string) => {
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, likedBy: { $ne: userId } },
    {
      $inc: { likes: 1 },
      $push: { likedBy: userId },
    },
    { new: true, runValidators: true },
  );

  if (!updatedComment) {
    const unlikedComment = await Comment.findOneAndUpdate(
      { _id: commentId, likedBy: { $in: [userId] } },
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
// reply comments
const replyToComment = async (
  commentId: string,
  userId: string,
  content: string,
) => {
  if (!content.trim()) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Reply content cannot be empty',
    );
  }

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Parent comment not found');
  }

  // Create reply without saving it yet
  const reply = new Comment({
    userId,
    postId: parentComment.postId,
    content,
    likes: 0,
    replies: [],
  });

  const replyId = reply._id;

  await reply.save();
  // Add the new reply to the parent comment's reply list
  const result = await Comment.findByIdAndUpdate(commentId, {
    $push: { replies: replyId },
  });

  if (!result) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update parent comment with the new reply',
    );
  }

  return reply;
};

export const CommentsService = {
  createCommentToDB,
  likeComment,
  replyToComment,
  getComments,
};
