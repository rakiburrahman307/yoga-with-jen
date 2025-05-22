import mongoose, { Document, Types } from 'mongoose';

export interface IComments extends Document {
     commentCreatorId: Types.ObjectId;
     postId: Types.ObjectId;
     content: string;
     likes: number;
     likedBy: Types.ObjectId[];
     replies: mongoose.Schema.Types.ObjectId[];
     depth: number;
}
