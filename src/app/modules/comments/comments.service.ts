import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Community } from '../community/community.model';
import { Comment } from './comments.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';

// create comment - MAIN COMMENT (depth 0)
const createCommentToDB = async (commentCreatorId: string, postId: string, content: string) => {
     if (!content.trim()) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Content cannot be empty');
     }
     const isPostExist = await Community.findById(postId);
     if (!isPostExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Post not found!');
     }
     const postCreator = await User.findById(isPostExist.userId);
     if (!postCreator) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }
     const user = await User.findById(commentCreatorId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }

     // FIXED: Main comments should have depth 0, not undefined
     const newComment = new Comment({
          commentCreatorId,
          postId,
          content,
          likes: 0,
          replies: [],
          depth: 0, // Main comment
     });
     await newComment.save();

     // Add the new comment to the post's comment list
     const result = await Community.findByIdAndUpdate(postId, {
          $push: { comments: newComment._id },
     });
     if (!result) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update post with the new comment');
     }

     // send notifications
     if (commentCreatorId !== postCreator._id.toString()) {
          await sendNotifications({
               title: `${user.name}`,
               receiver: postCreator._id,
               message: `A new comment has been posted`,
               type: 'MESSAGE',
          });
     }
     return newComment;
};

// FIXED: Populate function for replies
function buildPopulateReplies(depth: number): any {
     if (depth === 0) return null;

     return {
          path: 'replies',
          populate: [
               { path: 'commentCreatorId', select: 'name image email' },
               // only add nested populate if depth > 1
               ...(depth > 1 ? [buildPopulateReplies(depth - 1)] : []),
          ],
     };
}

// FIXED: Get comments - only fetch main comments (depth 0)
const getComments = async (postId: string, userId: string, query: Record<string, unknown>) => {
     const baseQuery = Comment.find({ postId, depth: 0 })
          .populate('commentCreatorId', 'name image createdAt')
          .populate({
               path: 'replies',
               populate: {
                    path: 'commentCreatorId',
                    select: 'name image email',
               },
               options: { sort: { createdAt: 1 } },
          });

     const queryBuilder = new QueryBuilder(baseQuery, query);
     const comments = await queryBuilder.paginate().modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     const postsWithFavorites = await Promise.all(
          comments.map(async (post: any) => {
               const isLiked = post.likedBy.some((id: string) => id.toString() === userId);

               // Add isLiked to each reply
               const repliesWithIsLiked = post.replies.map((reply: any) => {
                    const replyIsLiked = reply.likedBy.some((id: string) => id.toString() === userId);
                    return {
                         ...reply.toObject(),
                         isLiked: replyIsLiked,
                    };
               });

               return {
                    ...post.toObject(),
                    isLiked,
                    replies: repliesWithIsLiked,
               };
          }),
     );

     return { comments: postsWithFavorites, meta };
};

// like comments - NO CHANGES NEEDED
const likeComment = async (commentId: string, userId: string) => {
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }
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
               throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found or user has not liked it yet');
          }

          return { likes: unlikedComment.likes };
     }

     return { likes: updatedComment.likes };
};

// FIXED: Reply comments - proper logic for flat structure
const replyToComment = async (commentId: string, commentCreatorId: string, content: string) => {
     if (!content.trim()) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Reply content cannot be empty');
     }

     // Find the comment to reply to
     const parentComment = await Comment.findById(commentId);
     if (!parentComment) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Parent comment not found');
     }

     // Validate user creating the reply
     const user = await User.findById(commentCreatorId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }

     // FIXED: Find the main parent comment (depth 0)
     let targetParentId = commentId;

     // If replying to a reply (depth >= 1), find the main parent comment
     if (parentComment.depth > 0) {
          // Find the main parent comment (depth 0) that contains this reply
          const mainParent = await Comment.findOne({
               postId: parentComment.postId,
               depth: 0,
               replies: { $in: [parentComment._id] },
          });

          if (mainParent) {
               targetParentId = mainParent._id?.toString() ?? commentId;
          }
     }

     // Create the reply comment - always with depth 1
     const reply = new Comment({
          commentCreatorId,
          postId: parentComment.postId,
          content,
          likes: 0,
          replies: [],
          depth: 1, // All replies stay at depth 1
     });

     await reply.save();

     // Add the reply to the target parent comment's replies array
     const result = await Comment.findByIdAndUpdate(targetParentId, {
          $push: { replies: reply._id },
     });

     if (!result) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update parent comment with the new reply');
     }

     // Send notification to the person being replied to
     if (commentCreatorId !== parentComment.commentCreatorId.toString()) {
          await sendNotifications({
               title: `${user.name}`,
               receiver: parentComment.commentCreatorId,
               message: `A new reply has been posted`,
               type: 'MESSAGE',
          });
     }

     return reply;
};

// edit comments - NO MAJOR CHANGES NEEDED
const editComment = async (commentId: string, payload: string, commentCreatorId: string) => {
     const isExist: any = await Comment.findById(commentId).populate('replies');

     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found!');
     }

     if (isExist.commentCreatorId.toString() !== commentCreatorId) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to edit this comment');
     }
     const updateComment = await Comment.findByIdAndUpdate(commentId, { content: payload }, { new: true });

     if (!updateComment) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found');
     }

     return updateComment;
};

// FIXED: Delete comment - proper recursive deletion and cleanup
const deleteComment = async (commentId: string, commentCreatorId: string) => {
     const commentToDelete: any = await Comment.findById(commentId).populate('replies');

     if (!commentToDelete) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found!');
     }

     if (commentToDelete.commentCreatorId.toString() !== commentCreatorId) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this comment');
     }

     // FIXED: Recursively delete all replies first
     if (commentToDelete.replies.length > 0) {
          for (const reply of commentToDelete.replies) {
               // Delete reply without authorization check (cascade delete)
               await Comment.findByIdAndDelete(reply._id || reply);
          }
     }

     // Remove the comment from the post's comments array (only if it's a main comment)
     if (commentToDelete.depth === 0) {
          await Community.findByIdAndUpdate(commentToDelete.postId, {
               $pull: { comments: commentId },
          });
     }

     // Remove the comment from any parent comment's replies array
     await Comment.updateMany({ replies: commentId }, { $pull: { replies: commentId } });

     // Delete the comment itself
     const result = await Comment.findByIdAndDelete(commentId);

     return result;
};

export const CommentsService = {
     createCommentToDB,
     likeComment,
     replyToComment,
     getComments,
     editComment,
     deleteComment,
};
