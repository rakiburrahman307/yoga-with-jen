import { Schema } from 'mongoose';

export interface IVideo {
     title: string;
     serial: number;
     categoryId: Schema.Types.ObjectId;
     subCategoryId: Schema.Types.ObjectId;
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
