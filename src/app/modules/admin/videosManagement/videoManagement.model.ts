import mongoose, { Schema, Types } from 'mongoose';
import { IVideo } from './videoManagement.interface';

// 👤 Define a Reply Schema with likes
const ReplySchema = new Schema(
     {
          userId: { type: Types.ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          likes: [{ type: Types.ObjectId, ref: 'User' }], // 👍 Users who liked this reply
          createdAt: { type: Date, default: Date.now },
     },
     { _id: true },
);

// 💬 Define a Comment Schema with replies and likes
const CommentSchema = new Schema(
     {
          userId: { type: Types.ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          replies: [ReplySchema],
          likes: [{ type: Types.ObjectId, ref: 'User' }], // 👍 Users who liked this comment
          createdAt: { type: Date, default: Date.now },
     },
     { _id: true },
);

// 🎥 Video schema with embedded comments
const VideoSchema = new Schema<IVideo>(
     {
          title: { type: String, required: true },
          serial: { type: Number, default: 0 },
          categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, trim: true },
          subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', trim: true, default: '' },
          duration: { type: String, required: true },
          equipment: { type: [String], required: true },
          type: { type: String, enum: ['class', 'course'], required: true },
          thumbnailUrl: { type: String, required: true },
          videoUrl: { type: String, required: true },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },

          comments: [CommentSchema], // 🆕 Comment system with likes and replies
     },
     { timestamps: true },
);

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
