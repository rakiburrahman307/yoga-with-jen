import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ICommunityPost } from './community.interface';
import { Community } from './community.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';
import { Comment } from '../comments/comments.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createPostToDb = async (userId: string, content: string): Promise<ICommunityPost> => {
     const newPost = new Community({
          userId,
          content,
          likes: 0,
          comments: [],
     });

     await newPost.save();
     return newPost;
};
const getPostById = async (userId: string, postId: string) => {
     const result = await Community.findById(postId)
          // First, populate the post's userId field
          .populate({
               path: 'userId',
               select: 'name image createdAt',
          })
          .setOptions({ strictPopulate: false });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Post not found!');
     }
     const isLiked = result.likedBy.some((id) => id.toString() === userId.toString());
     return {
          ...result.toObject(),
          isLiked,
     };
};
// edit post
const editPost = async (id: string, payload: string, userId: string) => {
     if (!payload) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Content is required to update the post');
     }
     const isExistPost = await Community.findById(id);
     if (!isExistPost) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
     }

     // Step 2: Ensure the user is the post creator
     if (isExistPost.userId.toString() !== userId) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to edit this post');
     }
     const updatePost = await Community.findByIdAndUpdate(id, { content: payload }, { new: true });

     if (!updatePost) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Post not found or could not update');
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
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this post');
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
     //  if (updatedComment) {
     //       await sendNotifications({
     //            receiver: updatedComment.userId,
     //            message: `User '${user.name}' liked your comment`,
     //            type: 'MESSAGE',
     //       });
     //  }
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
               throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found or user has not liked it yet');
          }

          return { likes: unlikedComment.likes };
     }

     return { likes: updatedComment.likes };
};
// get all post
const getAllPosts = async (userId: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Community.find({}).populate('userId', 'name image'), query);

     const posts = await queryBuilder.paginate().filter().sort().fields().modelQuery.exec();

     const postsWithFavorites = await Promise.all(
          posts.map(async (post: any) => {
               const isLiked = post.likedBy.some((id: string) => id.toString() === userId);
               return {
                    ...post.toObject(),
                    isLiked,
               };
          }),
     );

     const meta = await queryBuilder.countTotal();
     return { posts: postsWithFavorites, meta };
};
// get get Specific User post
const getSpecificUserPost = async (userId: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Community.find({ userId }), query);

     const posts = await queryBuilder.paginate().filter().sort().fields().modelQuery.populate('userId', 'name').exec();
     const meta = await queryBuilder.countTotal();
     const postsWithFavorites = await Promise.all(
          posts.map(async (post: any) => {
               const isLiked = post.likedBy.some((id: string) => id.toString() === userId);
               return {
                    ...post.toObject(),
                    isLiked,
               };
          }),
     );
     return {
          posts: postsWithFavorites,
          meta,
     };
};
const getAnalysis = async () => {
     const limit = 5;

     // 1. Top users by matTime (convert matTime string to number for sorting)
     const topByMatTimePromise = User.aggregate([
          {
               $addFields: {
                    matTimeNum: { $toDouble: '$matTime' }, // convert matTime string to double
               },
          },
          { $sort: { matTimeNum: -1 } },
          { $limit: limit },
          { $project: { _id: 1, name: 1, matTime: 1 } },
     ]);

     // 2. Top users by loginCount (simple find query)
     const topByLoginCountPromise = User.find().sort({ loginCount: -1 }).limit(limit).select('_id name loginCount').lean();

     // 3. Top users by completedSessions count
     const topByCompletedSessionsPromise = User.aggregate([
          {
               $project: {
                    name: 1,
                    _id: 1,
                    completedSessionsCount: {
                         $size: { $ifNull: ['$completedSessions', []] }, // safe check for missing field
                    },
               },
          },
          { $sort: { completedSessionsCount: -1 } },
          { $limit: limit },
     ]);

     // Await all queries in parallel
     const [topByMatTime, topByLoginCount, topByCompletedSessions] = await Promise.all([topByMatTimePromise, topByLoginCountPromise, topByCompletedSessionsPromise]);

     return {
          topByMatTime,
          topByLoginCount,
          topByCompletedSessions,
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
     getAnalysis,
};
