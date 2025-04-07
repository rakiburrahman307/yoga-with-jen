import mongoose, { Document } from 'mongoose';

export interface ICommunityPost extends Document {
  userId: string;
  content: string;
  likes: number;
  likedBy: mongoose.Schema.Types.ObjectId[];
  comments: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
