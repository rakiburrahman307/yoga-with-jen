import mongoose, { Document } from "mongoose";

export interface IDailyVideo extends Document {
  date: string;
  videoId: mongoose.Types.ObjectId;
  createdAt: Date;
}