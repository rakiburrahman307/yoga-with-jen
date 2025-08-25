import mongoose from 'mongoose';
import { Schema } from 'mongoose';

export interface IVideos {
    title: string;
    serial: number;
    duration: string;
    type: string;
    category: string;
    subCategory: string;
    categoryId: mongoose.Types.ObjectId;
    subCategoryId: mongoose.Types.ObjectId;
    equipment: string[];
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
    status: 'active' | 'inactive';
    likes: number;
    likedBy: Schema.Types.ObjectId[];
    comments: Schema.Types.ObjectId[];
}
