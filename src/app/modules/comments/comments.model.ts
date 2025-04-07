import mongoose, { Schema } from 'mongoose';
import { IComments } from './comments.interface';

const commentSchema = new Schema<IComments>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, required: true, ref: 'Community' },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComments>('Comment', commentSchema);
