import mongoose, { Schema } from 'mongoose';
import { IComments } from './comments.interface';

const commentSchema = new Schema<IComments>(
     {
          commentCreatorId: {
               type: Schema.Types.ObjectId,
               required: true,
               ref: 'User',
          },
          postId: { type: Schema.Types.ObjectId, required: true, ref: 'Community' },
          content: { type: String, required: true },
          likes: { type: Number, default: 0 },
          likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
          replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
          depth: { type: Number, default: 1 },
     },
     { timestamps: true },
);
// remove the likedBy field in responce
commentSchema.set('toJSON', {
     transform: (doc, ret, options) => {
          delete ret.likedBy;
          return ret;
     },
});
export const Comment = mongoose.model<IComments>('Comment', commentSchema);
