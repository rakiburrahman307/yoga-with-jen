import mongoose, { Schema } from 'mongoose';
import { IChallenge } from './challenges.interface';
const VideoSchema = new Schema<IChallenge>(
     {
          title: { type: String, required: true },
          challengeId: { type: Schema.Types.ObjectId, ref: 'ChallengeCategory', required: true },
          challengeName: { type: String, required: true, trim: true },
          duration: { type: String, default: '00:00' },
          equipment: { type: [String], default: [] },
          thumbnailUrl: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          description: { type: String, required: true },
          publishAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);
export const ChallengeVideo = mongoose.model<IChallenge>('ChallengeVideo', VideoSchema);
