import mongoose, { Schema } from 'mongoose';
import { ICreatePost } from './creaetPost.interface';
const VideoSchema = new Schema<ICreatePost>(
     {
          title: { type: String, required: true },
          category: { type: String, required: true, trim: true },
          duration: { type: String, required: true },
          equipment: { type: [String], required: true },
          thumbnailUrl: { type: String, required: true },
          videoUrl: { type: String, required: true },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);

export const CreatePost = mongoose.model<ICreatePost>('CreatePost', VideoSchema);
