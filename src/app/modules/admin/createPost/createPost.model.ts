import mongoose, { Schema } from 'mongoose';
import { ICreatePost } from './createPost.interface';
const VideoSchema = new Schema<ICreatePost>(
     {
          title: { type: String, required: false },
          type: { type: String, required: true, trim: true },
          duration: { type: String, default: '00:00' },
          equipment: { type: [String], default: [] },
          thumbnailUrl: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          description: { type: String, required: false },
          publishAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
          isDeleted: { type: Boolean, default: false },
     },
     { timestamps: true },
);

export const CreatePost = mongoose.model<ICreatePost>('CreatePost', VideoSchema);
