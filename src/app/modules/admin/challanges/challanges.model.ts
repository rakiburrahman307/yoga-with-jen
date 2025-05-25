import mongoose, { Schema } from 'mongoose';
import { IChallenge } from './challanges.interface';
const VideoSchema = new Schema<IChallenge>(
     {
          title: { type: String, required: true },
          category: { type: String, required: true, trim: true },
          duration: { type: String, default: '00:00' },
          equipment: { type: [String], default: [] },
          thumbnailUrl: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);

export const Challenge = mongoose.model<IChallenge>('Challenge', VideoSchema);
