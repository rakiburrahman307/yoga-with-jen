import { Schema } from 'mongoose';

export interface IReply {
     _id?: string;
     userId: string; // Reference to User
     content: string;
     likes: string[]; // Array of User IDs who liked this reply
     createdAt?: Date;
}

export interface IComment {
     _id?: string;
     userId: string; // Reference to User
     content: string;
     likes: string[]; // Array of User IDs who liked this comment
     replies: IReply[]; // Nested replies
     createdAt?: Date;
}

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
     comments?: IComment[]; // Optional comments field
}
