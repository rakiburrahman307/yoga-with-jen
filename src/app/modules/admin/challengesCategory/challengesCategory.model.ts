import mongoose, { Schema } from 'mongoose';
import { IChallengeCategory } from './challengesCategory.interface';

const challengeSchema = new Schema<IChallengeCategory>(
     {
          name: { type: String, required: true },
          series: { type: Number, required: false, default: 1 },
          image: { type: String, required: true, trim: true },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     { timestamps: true },
);

export const ChallengeCategory = mongoose.model<IChallengeCategory>('ChallengeCategory', challengeSchema);
