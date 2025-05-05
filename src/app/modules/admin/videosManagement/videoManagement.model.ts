import mongoose, { Schema } from 'mongoose';
import { IVideo } from './videoManagement.interface';
const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    type: { type: String, required: true, enum: ['free', 'paid'] },
    equipment: { type: [String], required: true },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
);

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
