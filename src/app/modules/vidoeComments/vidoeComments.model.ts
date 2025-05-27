import mongoose, { Schema } from 'mongoose';
import { IComments } from './vidoeComments.interface';

const commentSchema = new Schema<IComments>(
     {
          commentCreatorId: {
               type: Schema.Types.ObjectId,
               required: true,
               ref: 'User',
          },
          videoId: { type: Schema.Types.ObjectId, required: true, ref: 'Video' },
          content: { type: String, required: true },
          likes: { type: Number, default: 0 },
          likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
          replies: [{ type: Schema.Types.ObjectId, ref: 'VideoComment' }],
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
export const VideoComment = mongoose.model<IComments>('VideoComment', commentSchema);
