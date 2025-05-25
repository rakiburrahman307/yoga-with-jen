import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Community } from '../community/community.model';
import { Comment } from './comments.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';

// create comment
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
     const newComment = new Comment({
          commentCreatorId,
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
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update parent comment with the new reply');
     }
     // send notifications
     // await sendNotifications({
     //      receiver: postCreator._id,
     //      message: `A new comment has been posted by ${user.name}`,
     //      type: 'MESSAGE',
     // });
     return newComment;
};
// get comments
function buildPopulateReplies(depth: number): any {
     if (depth === 0) return null; // or return undefined, but filter later

     // Build nested populate object
     return {
          path: 'replies',
          populate: [
               { path: 'commentCreatorId', select: 'name image email' },
               // only add nested populate if depth > 1
               ...(depth > 1 ? [buildPopulateReplies(depth - 1)] : []),
          ],
     };
}

const getComments = async (postId: string, query: Record<string, unknown>) => {
     // Create a query that finds only top-level comments (depth: 1) for the post
     const baseQuery = Comment.find({ postId, depth: 1 }).populate("commentCreatorId", "name image createdAt").populate(buildPopulateReplies(3));

     // Use your QueryBuilder with pagination and filtering options
     const queryBuilder = new QueryBuilder(baseQuery, query);

     // Execute paginated query
     const comments = await queryBuilder.paginate().modelQuery.exec();

     // Get total count for pagination metadata
     const meta = await queryBuilder.countTotal();

     return { comments, meta };
};
// like comments
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
     // if (updatedComment) {
     //      await sendNotifications({
     //           receiver: updatedComment.commentCreatorId,
     //           message: `User '${user.name}' liked your comment`,
     //           type: 'MESSAGE',
     //      });
     // }
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
// reply comments
const replyToComment = async (commentId: string, commentCreatorId: string, content: string) => {
     if (!content.trim()) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Reply content cannot be empty');
     }

     // Find the parent comment to reply to
     const parentComment = await Comment.findById(commentId);
     if (!parentComment) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Parent comment not found');
     }
     // Validate user creating the reply
     const user = await User.findById(commentCreatorId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
     }

     let replyDepth = parentComment.depth < 4 ? parentComment.depth + 1 : 4;

     // Create the reply comment
     const reply = new Comment({
          commentCreatorId,
          postId: parentComment.postId,
          content,
          likes: 0,
          replies: [],
          depth: replyDepth,
     });

     const replyId = reply._id;

     await reply.save();

     // Add the reply to the parent comment's replies
     // If parent is already at depth 4, we still add the reply to parent's replies
     const result = await Comment.findByIdAndUpdate(parentComment._id, {
          $push: { replies: replyId },
     });

     if (!result) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update parent comment with the new reply');
     }

     // Send notification to the original commenter (parent comment's creator)
     // await sendNotifications({
     //      receiver: user._id,
     //      message: `User '${user.name}' has replied to your comment`,
     //      type: 'MESSAGE',
     // });

     return reply;
};
// edit comments
const editComment = async (commentId: string, payload: string, commentCreatorId: string) => {
     const isExist: any = await Comment.findById(commentId).populate('replies');

     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found!');
     }

     if (isExist.commentCreatorId.toString() !== commentCreatorId) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to edit this comment');
     }
     const updateComment = await Comment.findByIdAndUpdate(commentId, { content: payload }, { new: true });
     // If the comment is not found
     if (!updateComment) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found');
     }

     return updateComment;
};
const deleteComment = async (commentId: string, commentCreatorId: string) => {
     const commentToDelete: any = await Comment.findById(commentId).populate('replies');

     if (!commentToDelete) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found!');
     }

     if (commentToDelete.commentCreatorId.toString() !== commentCreatorId) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this comment');
     }

     if (commentToDelete.replies.length > 0) {
          for (const reply of commentToDelete.replies) {
               await deleteComment(reply._id, commentCreatorId);
          }
     }

     // Step 3: Remove the comment from the post's comments array
     const postUpdate = await Community.findByIdAndUpdate(commentToDelete.postId, {
          $pull: { comments: commentId },
     });

     if (!postUpdate) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update post with removed comment');
     }

     // Step 4: Remove the comment from any parent comment's replies array
     const parentUpdate = await Comment.updateMany({ replies: commentId }, { $pull: { replies: commentId } });

     if (!parentUpdate) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to remove comment from parent replies');
     }

     // Step 5: Delete the comment (and its replies)
     const result = await Comment.findByIdAndDelete(commentId);

     // Return the result of the deletion
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
