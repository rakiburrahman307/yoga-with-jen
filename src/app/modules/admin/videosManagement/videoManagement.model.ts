import mongoose, { Schema } from 'mongoose';
import { IVideo } from './videoManagement.interface';

// 🎥 Video schema with embedded comments
const VideoSchema = new Schema<IVideo>(
     {
          title: { type: String, required: true },
          serial: { type: Number, default: 1 },
          duration: { type: String, required: true },
          equipment: { type: [String], required: true },
          thumbnailUrl: { type: String, required: true },
          videoUrl: { type: String, required: true },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
          comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
     },
     { timestamps: true },
);

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
