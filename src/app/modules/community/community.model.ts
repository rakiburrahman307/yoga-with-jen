import mongoose, { Schema } from 'mongoose';
import { ICommunityPost } from './community.interface';

const communityPostSchema = new Schema<ICommunityPost>(
  {
    userId: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true },
);

export const Community = mongoose.model<ICommunityPost>(
  'Community',
  communityPostSchema,
);
