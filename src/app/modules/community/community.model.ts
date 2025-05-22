import mongoose, { Schema } from 'mongoose';
import { ICommunityPost } from './community.interface';

const communityPostSchema = new Schema<ICommunityPost>(
     {
          userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
          content: { type: String, required: true },
          likes: { type: Number, default: 0 },
          likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
          comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
     },
     { timestamps: true },
);
// remove the likedBy field in responce
communityPostSchema.set('toJSON', {
     transform: (doc, ret, options) => {
          delete ret.likedBy;
          return ret;
     },
});
export const Community = mongoose.model<ICommunityPost>('Community', communityPostSchema);
