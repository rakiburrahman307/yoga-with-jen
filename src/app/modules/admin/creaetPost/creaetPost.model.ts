import mongoose, { Schema } from 'mongoose';
import { ICreatePost } from './creaetPost.interface';
const VideoSchema = new Schema<ICreatePost>(
     {
          title: { type: String, required: false },
          type: { type: String, required: true, trim: true },
          duration: { type: String, default: '00:00' },
          equipment: { type: [String], default: [] },
          thumbnailUrl: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          description: { type: String, required: false },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);

export const CreatePost = mongoose.model<ICreatePost>('CreatePost', VideoSchema);
