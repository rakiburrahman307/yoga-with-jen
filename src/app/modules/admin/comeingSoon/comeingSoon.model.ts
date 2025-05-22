import mongoose, { Schema } from 'mongoose';
import { IComeingSoon } from './comeingSoon.interface';
const VideoSchema = new Schema<IComeingSoon>(
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

export const ComeingSoon = mongoose.model<IComeingSoon>('ComeingSoon', VideoSchema);
