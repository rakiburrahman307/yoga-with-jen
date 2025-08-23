import { Schema } from 'mongoose';

export interface IVideos {
    title: string;
    serial: number;
    duration: string;
    type: 'class' | 'course';
    category: string;
    subCategory: string;
    categoryId: string;
    subCategoryId: string;
    equipment: string[];
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
    status: 'active' | 'inactive';
    likes: number;
    likedBy: Schema.Types.ObjectId[];
    comments: Schema.Types.ObjectId[];
}
