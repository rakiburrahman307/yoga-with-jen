import mongoose, { Schema } from 'mongoose';
import { IDailyInspiration } from './dailyInspiration.interface';
const VideoSchema = new Schema<IDailyInspiration>(
     {
          title: { type: String, required: true },
          serial: { type: Number, require: false, default: 1 },
          duration: { type: String, default: '00:00' },
          equipment: { type: [String], default: [] },
          thumbnailUrl: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          description: { type: String, required: true },
          publishAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
     },
     { timestamps: true },
);

export const DailyInspiration = mongoose.model<IDailyInspiration>('DailyInspiration', VideoSchema);
