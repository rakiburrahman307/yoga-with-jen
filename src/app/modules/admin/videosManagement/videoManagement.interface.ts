import mongoose, { Schema } from 'mongoose';

export interface IVideo {
     title: string;
     serial: number;
     duration: string;
     type: 'class' | 'course';
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     status: 'active' | 'inactive';
     likes: number;
     likedBy: Schema.Types.ObjectId[];
     comments: Schema.Types.ObjectId[];
}
export type VideoIdInput = string | mongoose.Types.ObjectId | (string | mongoose.Types.ObjectId)[];
// Type definitions
export interface IVideoLibrary {
     _id: mongoose.Types.ObjectId;
     title: string;
     description?: string;
     url: string;
     duration?: string;
     thumbnailUrl?: string;
     tags?: string[];
     createdAt: Date;
     updatedAt: Date;
     toObject(): any;
}