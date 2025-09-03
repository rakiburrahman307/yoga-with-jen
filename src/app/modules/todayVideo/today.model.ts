import mongoose, { Schema } from "mongoose";
import { IDailyVideo } from "./today.interface";

// DailyVideo Schema
const DailyVideoSchema: Schema<IDailyVideo> = new Schema({
  date: {
    type: String,
    required: true,
    unique: true, // Ensure only one video per day
    index: true // Index for faster queries
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Videos',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto delete after 30 days (optional)
  }
});
export const DailyVideo = mongoose.model<IDailyVideo>('DailyVideo', DailyVideoSchema);
