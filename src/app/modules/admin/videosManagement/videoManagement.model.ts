import mongoose, { Schema, Types } from 'mongoose';
import { IVideo } from './videoManagement.interface';

// 🎥 Video schema with embedded comments
const VideoSchema = new Schema<IVideo>(
     {
          title: { type: String, required: true },
          serial: { type: Number, default: 1 },
          categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, trim: true },
          subCategoryId: {
               type: mongoose.Schema.Types.ObjectId,
               required: false,
               ref: 'SubCategory',
               // Custom setter to handle empty strings
               set: function (value: any) {
                    // If empty string or null/undefined, return null
                    if (value === '' || value === null || value === undefined) {
                         return null;
                    }
                    return value;
               },
          },
          duration: { type: String, required: true },
          equipment: { type: [String], required: true },
          type: { type: String, enum: ['class', 'course'], required: true },
          thumbnailUrl: { type: String, required: true },
          videoUrl: { type: String, required: true },
          description: { type: String, required: true },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
          comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
     },
     { timestamps: true },
);

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
