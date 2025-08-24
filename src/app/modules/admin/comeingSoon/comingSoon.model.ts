import mongoose, { Schema } from 'mongoose';
import { IComingSoon } from './comingSoon.interface';
const VideoSchema = new Schema<IComingSoon>(
     {
          title: { type: String, required: true },
          category: { type: String, required: true, trim: true },
          duration: { type: String, required: false, default: '' },
          equipment: { type: [String], required: true },
          thumbnailUrl: { type: String, required: true },
          videoUrl: { type: String, required: false, default: '' },
          description: { type: String, required: true },
          isReady: { type: String, enum: ['arrivedSoon', 'ready'], default: 'arrivedSoon' },
          redirectUrl: { type: String, default: '' },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);

export const ComingSoon = mongoose.model<IComingSoon>('ComingSoon', VideoSchema);
